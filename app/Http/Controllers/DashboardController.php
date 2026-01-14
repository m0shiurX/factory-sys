<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Production;
use App\Models\Sale;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController
{
    public function index(): Response
    {
        $today = today();
        $thisMonth = now()->startOfMonth();

        // Sales stats
        $salesStats = [
            'total_sales' => Sale::query()->count(),
            'today_sales' => Sale::query()->whereDate('sale_date', $today)->count(),
            'today_sales_amount' => (float) Sale::query()->whereDate('sale_date', $today)->sum('net_amount'),
            'this_month_sales_amount' => (float) Sale::query()->whereDate('sale_date', '>=', $thisMonth)->sum('net_amount'),
        ];

        // Payment stats
        $paymentStats = [
            'total_payments' => Payment::query()->count(),
            'today_payments' => Payment::query()->whereDate('payment_date', $today)->count(),
            'today_payment_amount' => (float) Payment::query()->whereDate('payment_date', $today)->sum('amount'),
            'this_month_payment_amount' => (float) Payment::query()->whereDate('payment_date', '>=', $thisMonth)->sum('amount'),
        ];

        // Expense stats
        $expenseStats = [
            'total_expenses' => Expense::query()->count(),
            'today_expenses' => Expense::query()->whereDate('expense_date', $today)->count(),
            'today_expense_amount' => (float) Expense::query()->whereDate('expense_date', $today)->sum('amount'),
            'this_month_expense_amount' => (float) Expense::query()->whereDate('expense_date', '>=', $thisMonth)->sum('amount'),
        ];

        // Production stats
        $productionStats = [
            'total_productions' => Production::query()->count(),
            'today_productions' => Production::query()->whereDate('production_date', $today)->count(),
            'today_quantity' => (int) Production::query()->whereDate('production_date', $today)->sum('pieces_produced'),
            'this_month_quantity' => (int) Production::query()->whereDate('production_date', '>=', $thisMonth)->sum('pieces_produced'),
        ];

        // Stock summary
        $stockSummary = [
            'total_products' => Product::query()->count(),
            'low_stock_products' => Product::query()->whereColumn('stock_pieces', '<=', 'min_stock_alert')
                ->where('stock_pieces', '>', 0)
                ->count(),
            'out_of_stock_products' => Product::query()->where('stock_pieces', 0)->count(),
            'total_stock_quantity' => (int) Product::query()->sum('stock_pieces'),
        ];

        // Customer summary
        $customerSummary = [
            'total_customers' => Customer::query()->count(),
            'customers_with_dues' => Customer::query()->where('total_due', '>', 0)->count(),
            'total_outstanding' => (float) Customer::query()->where('total_due', '>', 0)->sum('total_due'),
        ];

        // Recent activities
        $recentSales = Sale::with('customer:id,name')
            ->latest('sale_date')
            ->orderByDesc('id')
            ->take(5)
            ->get(['id', 'customer_id', 'sale_date', 'net_amount']);

        $recentPayments = Payment::with('customer:id,name')
            ->latest('payment_date')
            ->orderByDesc('id')
            ->take(5)
            ->get(['id', 'customer_id', 'payment_date', 'amount']);

        $recentExpenses = Expense::with('category:id,name')
            ->latest('expense_date')
            ->orderByDesc('id')
            ->take(5)
            ->get(['id', 'expense_category_id', 'expense_date', 'amount', 'description']);

        // Weekly Sales vs Payments Chart Data (last 7 days)
        $weeklyChartData = $this->getWeeklyChartData();

        // Expense breakdown by category (this month)
        $expenseBreakdown = $this->getExpenseBreakdown($thisMonth);

        return Inertia::render('admin/dashboard', [
            'salesStats' => $salesStats,
            'paymentStats' => $paymentStats,
            'expenseStats' => $expenseStats,
            'productionStats' => $productionStats,
            'stockSummary' => $stockSummary,
            'customerSummary' => $customerSummary,
            'recentSales' => $recentSales,
            'recentPayments' => $recentPayments,
            'recentExpenses' => $recentExpenses,
            'weeklyChartData' => $weeklyChartData,
            'expenseBreakdown' => $expenseBreakdown,
        ]);
    }

    /**
     * Get weekly sales vs payments data for chart.
     *
     * @return array<int, array{date: string, day: string, sales: float, payments: float}>
     */
    private function getWeeklyChartData(): array
    {
        $startDate = now()->subDays(6)->startOfDay();
        $endDate = now()->endOfDay();

        // Get sales by date
        $salesByDate = Sale::query()
            ->whereBetween('sale_date', [$startDate, $endDate])
            ->select([
                DB::raw('DATE(sale_date) as date'),
                DB::raw('COALESCE(SUM(net_amount), 0) as total'),
            ])
            ->groupBy('date')
            ->pluck('total', 'date')
            ->toArray();

        // Get payments by date
        $paymentsByDate = Payment::query()
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->select([
                DB::raw('DATE(payment_date) as date'),
                DB::raw('COALESCE(SUM(amount), 0) as total'),
            ])
            ->groupBy('date')
            ->pluck('total', 'date')
            ->toArray();

        $chartData = [];
        $period = CarbonPeriod::create($startDate, $endDate);

        foreach ($period as $date) {
            $dateString = $date->format('Y-m-d');
            $chartData[] = [
                'date' => $dateString,
                'day' => $date->format('D'),
                'sales' => (float) ($salesByDate[$dateString] ?? 0),
                'payments' => (float) ($paymentsByDate[$dateString] ?? 0),
            ];
        }

        return $chartData;
    }

    /**
     * Get expense breakdown by category for this month.
     *
     * @return array<int, array{name: string, value: float, fill: string}>
     */
    private function getExpenseBreakdown(\Carbon\CarbonInterface $monthStart): array
    {
        $expenses = Expense::query()
            ->whereDate('expense_date', '>=', $monthStart)
            ->join('expense_categories', 'expenses.expense_category_id', '=', 'expense_categories.id')
            ->select([
                'expense_categories.name',
                DB::raw('COALESCE(SUM(expenses.amount), 0) as total'),
            ])
            ->groupBy('expense_categories.id', 'expense_categories.name')
            ->orderByDesc('total')
            ->limit(6)
            ->get();

        $colors = [
            'hsl(var(--chart-1))',
            'hsl(var(--chart-2))',
            'hsl(var(--chart-3))',
            'hsl(var(--chart-4))',
            'hsl(var(--chart-5))',
            'hsl(220 70% 50%)',
        ];

        return $expenses->values()->map(fn($expense, $index) => [
            'name' => $expense->name,
            'value' => (float) $expense->total,
            'fill' => $colors[$index] ?? $colors[0],
        ])->toArray();
    }
}
