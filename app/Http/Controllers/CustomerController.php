<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Payment;
use App\Models\Sale;
use DateTimeInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CustomerController
{
    /**
     * Display a listing of customers.
     */
    public function index(Request $request): Response
    {
        $query = Customer::query();

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Due filter
        if ($request->input('has_due') === 'true') {
            $query->where('total_due', '>', 0);
        }

        $customers = $query->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Calculate stats
        $stats = [
            'total' => Customer::query()->count(),
            'active' => Customer::query()->where('is_active', true)->count(),
            'with_due' => Customer::query()->where('total_due', '>', 0)->count(),
            'total_due' => Customer::query()->sum('total_due'),
        ];

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'active', 'has_due']),
        ]);
    }

    /**
     * Show the form for creating a new customer.
     */
    public function create(): Response
    {
        return Inertia::render('admin/customers/create');
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'opening_balance' => ['nullable', 'numeric', 'min:0'],
            'opening_date' => ['nullable', 'date'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['is_active'] ??= true;
        $validated['opening_balance'] ??= 0;
        $validated['opening_date'] ??= now()->toDateString();
        $validated['total_due'] = $validated['opening_balance'];
        $validated['credit_limit'] ??= 0;

        Customer::query()->create($validated);

        return to_route('customers.index')
            ->with('success', 'Customer created successfully.');
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer): Response
    {
        return Inertia::render('admin/customers/show', [
            'customer' => $customer,
        ]);
    }

    /**
     * Show the form for editing the specified customer.
     */
    public function edit(Customer $customer): Response
    {
        return Inertia::render('admin/customers/edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'opening_balance' => ['nullable', 'numeric', 'min:0'],
            'opening_date' => ['nullable', 'date'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        // Recalculate total_due if opening_balance changed
        if (isset($validated['opening_balance']) && $validated['opening_balance'] !== $customer->opening_balance) {
            $difference = $validated['opening_balance'] - $customer->opening_balance;
            $validated['total_due'] = $customer->total_due + $difference;
        }

        $customer->update($validated);

        return to_route('customers.index')
            ->with('success', 'Customer updated successfully.');
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return to_route('customers.index')
            ->with('success', 'Customer deleted successfully.');
    }

    /**
     * Display the customer statement.
     */
    public function statement(Request $request, Customer $customer): Response
    {
        // Default to current month if no dates provided
        $fromDate = $request->filled('from_date')
            ? \Illuminate\Support\Facades\Date::parse($request->string('from_date')->value())
            : \Illuminate\Support\Facades\Date::now()->startOfMonth();
        $toDate = $request->filled('to_date')
            ? \Illuminate\Support\Facades\Date::parse($request->string('to_date')->value())
            : \Illuminate\Support\Facades\Date::now()->endOfMonth();

        // Calculate opening balance
        $openingBalance = $this->calculateOpeningBalance($customer, $fromDate);

        // Get transactions within the period
        $sales = Sale::query()->where('customer_id', $customer->id)
            ->whereBetween('sale_date', [$fromDate, $toDate])
            ->select(['id', 'bill_no', 'sale_date', 'net_amount', 'paid_amount', 'due_amount'])
            ->oldest('sale_date')
            ->orderBy('id')
            ->get()
            ->map(fn ($sale): array => [
                'id' => $sale->id,
                'date' => $sale->sale_date->format('Y-m-d'),
                'type' => 'sale',
                'description' => "Sale #{$sale->bill_no}",
                'reference' => $sale->bill_no,
                'debit' => (float) $sale->due_amount,
                'credit' => 0,
            ]);

        $payments = Payment::query()->where('customer_id', $customer->id)
            ->whereBetween('payment_date', [$fromDate, $toDate])
            ->with('paymentType:id,name')
            ->select(['id', 'payment_date', 'amount', 'payment_ref', 'payment_type_id'])
            ->orderBy('payment_date')
            ->orderBy('id')
            ->get()
            ->map(fn (Payment $payment): array => [
                'id' => $payment->id,
                'date' => \Illuminate\Support\Facades\Date::parse($payment->payment_date)->format('Y-m-d'),
                'type' => 'payment',
                'description' => 'Payment'.($payment->paymentType ? " ({$payment->paymentType->name})" : ''),
                'reference' => $payment->payment_ref,
                'debit' => 0,
                'credit' => (float) $payment->amount,
            ]);

        // Merge and sort transactions by date
        $transactions = $sales->concat($payments)
            ->sortBy('date')
            ->values()
            ->all();

        // Calculate totals
        $totalDebit = array_sum(array_column($transactions, 'debit'));
        $totalCredit = array_sum(array_column($transactions, 'credit'));
        $closingBalance = $openingBalance + $totalDebit - $totalCredit;

        return Inertia::render('admin/customers/statement', [
            'customer' => $customer,
            'statement' => [
                'from_date' => $fromDate->format('Y-m-d'),
                'to_date' => $toDate->format('Y-m-d'),
                'opening_balance' => $openingBalance,
                'transactions' => $transactions,
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'closing_balance' => $closingBalance,
            ],
            'filters' => [
                'from_date' => $fromDate->format('Y-m-d'),
                'to_date' => $toDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Calculate opening balance for a customer as of a specific date.
     */
    private function calculateOpeningBalance(Customer $customer, DateTimeInterface $startDate): float
    {
        $openingBalance = 0.0;

        // Include customer's initial opening balance if applicable
        if ($customer->opening_date && \Illuminate\Support\Facades\Date::parse($customer->opening_date)->lt($startDate)) {
            $openingBalance = (float) $customer->opening_balance;
        }

        // Add all sales dues before the period
        $openingBalance += (float) Sale::query()->where('customer_id', $customer->id)
            ->where('sale_date', '<', $startDate)
            ->sum('due_amount');

        // Subtract all payments before the period
        $openingBalance -= (float) Payment::query()->where('customer_id', $customer->id)
            ->where('payment_date', '<', $startDate)
            ->sum('amount');

        return $openingBalance;
    }
}
