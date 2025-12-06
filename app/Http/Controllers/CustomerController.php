<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Customer;
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
            $query->where(function ($q) use ($search) {
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
            'total' => Customer::count(),
            'active' => Customer::where('is_active', true)->count(),
            'with_due' => Customer::where('total_due', '>', 0)->count(),
            'total_due' => Customer::sum('total_due'),
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

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['opening_balance'] = $validated['opening_balance'] ?? 0;
        $validated['opening_date'] = $validated['opening_date'] ?? now()->toDateString();
        $validated['total_due'] = $validated['opening_balance'];
        $validated['credit_limit'] = $validated['credit_limit'] ?? 0;

        Customer::create($validated);

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
}
