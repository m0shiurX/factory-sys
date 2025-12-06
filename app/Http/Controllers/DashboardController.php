<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Production;
use App\Models\Sale;
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
            'today_sales_amount' => (float) Sale::query()->whereDate('sale_date', $today)->sum('total_amount'),
            'this_month_sales_amount' => (float) Sale::query()->whereDate('sale_date', '>=', $thisMonth)->sum('total_amount'),
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
            'today_quantity' => (int) Production::query()->whereDate('production_date', $today)->sum('quantity'),
            'this_month_quantity' => (int) Production::query()->whereDate('production_date', '>=', $thisMonth)->sum('quantity'),
        ];

        // Stock summary
        $stockSummary = [
            'total_products' => Product::query()->count(),
            'low_stock_products' => Product::query()->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                ->where('stock_quantity', '>', 0)
                ->count(),
            'out_of_stock_products' => Product::query()->where('stock_quantity', 0)->count(),
            'total_stock_quantity' => (int) Product::query()->sum('stock_quantity'),
        ];

        // Customer summary
        $customerSummary = [
            'total_customers' => Customer::query()->count(),
            'customers_with_dues' => Customer::query()->where('balance', '>', 0)->count(),
            'total_outstanding' => (float) Customer::query()->where('balance', '>', 0)->sum('balance'),
        ];

        // Recent activities
        $recentSales = Sale::with('customer:id,name')
            ->latest('sale_date')
            ->orderByDesc('id')
            ->take(5)
            ->get(['id', 'customer_id', 'sale_date', 'total_amount']);

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
        ]);
    }
}
