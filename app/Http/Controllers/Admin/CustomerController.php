<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\CustomerSource;
use App\Enums\CustomerStatus;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
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
        $status = $request->query('status');
        $source = $request->query('source');
        $search = $request->query('search');

        $query = Customer::query()->withCount('orders');

        if (! empty($status)) {
            $query->where('status', $status);
        }

        if (! empty($source)) {
            $query->where('source', $source);
        }

        if (! empty($search)) {
            $query->where(function (Builder $q) use ($search): void {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        }

        $customers = $query->latest()->paginate(20)->withQueryString();

        // Stats
        $totalCustomers = Customer::query()->count();
        $leads = Customer::query()->where('status', CustomerStatus::Lead)->count();
        $active = Customer::query()->where('status', CustomerStatus::Active)->count();
        $pending = Customer::query()->where('status', CustomerStatus::Pending)->count();

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
            'stats' => [
                'total' => $totalCustomers,
                'leads' => $leads,
                'active' => $active,
                'pending' => $pending,
            ],
            'statuses' => CustomerStatus::options(),
            'sources' => CustomerSource::options(),
            'filters' => $request->only(['status', 'source', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new customer.
     */
    public function create(): Response
    {
        return Inertia::render('admin/customers/create', [
            'statuses' => CustomerStatus::options(),
            'sources' => CustomerSource::options(),
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^(\+?880)?0?1[3-9]\d{8}$/', 'unique:customers,phone'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'string'],
            'source' => ['required', 'string'],
            'admin_notes' => ['nullable', 'string'],
        ]);

        $customer = Customer::query()->create($validated);

        return to_route('admin.customers.show', $customer)
            ->with('success', 'Customer created successfully.');
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer): Response
    {
        $customer->load(['orders' => function (Builder $query): void {
            $query->with('payments')->latest()->take(10);
        }]);

        return Inertia::render('admin/customers/show', [
            'customer' => $customer,
            'statuses' => CustomerStatus::options(),
            'sources' => CustomerSource::options(),
        ]);
    }

    /**
     * Show the form for editing the specified customer.
     */
    public function edit(Customer $customer): Response
    {
        return Inertia::render('admin/customers/edit', [
            'customer' => $customer,
            'statuses' => CustomerStatus::options(),
            'sources' => CustomerSource::options(),
        ]);
    }

    /**
     * Update the specified customer.
     */
    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^(\+?880)?0?1[3-9]\d{8}$/', 'unique:customers,phone,'.$customer->id],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'string'],
            'admin_notes' => ['nullable', 'string'],
        ]);

        $customer->update($validated);

        return back()->with('success', 'Customer updated successfully.');
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        // Check if customer has orders
        if ($customer->orders()->exists()) {
            return back()->with('error', 'Cannot delete customer with orders.');
        }

        $customer->delete();

        return to_route('admin.customers.index')
            ->with('success', 'Customer deleted successfully.');
    }
}
