<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\CreateOrderAction;
use App\Http\Requests\Admin\StoreOrderRequest;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Inertia\Controller;
use Inertia\Inertia;
use Inertia\Response;

final class OrderController extends Controller
{
    /**
     * Plan configuration (ASCII only for PHP files).
     *
     * @var array<string, array{name: string, duration: string, amount: int, duration_days: int}>
     */
    private const array PLANS = [
        'monthly' => [
            'name' => 'Monthly Plan',
            'duration' => '1 Month',
            'amount' => 1000,
            'duration_days' => 30,
        ],
        'yearly' => [
            'name' => 'Yearly Plan',
            'duration' => '1 Year',
            'amount' => 10000,
            'duration_days' => 365,
        ],
        'mega-savings' => [
            'name' => '3 Year Mega Savings Plan',
            'duration' => '3 Years',
            'amount' => 25000,
            'duration_days' => 1095,
        ],
    ];

    /**
     * Payment methods available.
     *
     * @var array<string, string>
     */
    private const array PAYMENT_METHODS = [
        'bkash' => 'bKash',
        'nagad' => 'Nagad',
        'upay' => 'Upay',
        'bank' => 'Bank Transfer',
        'cash' => 'Cash',
    ];

    /**
     * Order status options.
     *
     * @var array<string, string>
     */
    private const array STATUSES = [
        'pending' => 'Pending',
        'verified' => 'Verified',
        'processing' => 'Processing',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
    ];

    /**
     * Display a listing of orders.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $search = $request->query('search');

        $query = Order::query()->with(['customer', 'payments']);

        if (! empty($status)) {
            $query->where('status', $status);
        }

        if (! empty($search)) {
            $query->where(function (Builder $q) use ($search): void {
                $q->where('order_number', 'like', '%' . $search . '%')
                    ->orWhereHas('customer', function (Builder $customerQuery) use ($search): void {
                        $customerQuery->where('name', 'like', '%' . $search . '%')
                            ->orWhere('phone', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%');
                    });
            });
        }

        $orders = $query->latest()->paginate(20)->withQueryString();

        // Stats
        $totalOrders = Order::query()->count();
        $pendingOrders = Order::query()->where('status', 'pending')->count();
        $completedOrders = Order::query()->where('status', 'completed')->count();
        $totalRevenue = Order::query()->where('status', 'completed')->sum('amount');
        $thisMonthOrders = Order::query()
            ->whereMonth('created_at', Date::now()->month)
            ->whereYear('created_at', Date::now()->year)
            ->count();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'stats' => [
                'total' => $totalOrders,
                'pending' => $pendingOrders,
                'completed' => $completedOrders,
                'revenue' => $totalRevenue,
                'thisMonth' => $thisMonthOrders,
            ],
            'statuses' => self::STATUSES,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new order.
     */
    public function create(): Response
    {
        return Inertia::render('admin/orders/create', [
            'plans' => self::PLANS,
            'paymentMethods' => self::PAYMENT_METHODS,
            'statuses' => self::STATUSES,
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(StoreOrderRequest $request, CreateOrderAction $action): RedirectResponse
    {
        $validated = $request->validated();

        // Get plan details
        $plan = self::PLANS[$validated['plan_slug']] ?? null;
        if (! $plan) {
            return back()->withErrors(['plan_slug' => 'Invalid plan selected.']);
        }

        // Find or create customer
        $customer = Customer::findOrCreateByPhone(
            $validated['customer_phone'],
            [
                'name' => $validated['customer_name'],
                'email' => $validated['customer_email'] ?? null,
                'address' => $validated['customer_address'] ?? null,
            ]
        );

        // Prepare order data for CreateOrderAction
        /** @var array{customer_id: int, plan_slug: string, plan_name: string, plan_duration: string, amount: int, payment_method: string, gateway_number?: string|null, transaction_id?: string|null} $orderData */
        $orderData = [
            'customer_id' => $customer->id,
            'plan_slug' => $validated['plan_slug'],
            'plan_name' => $plan['name'],
            'plan_duration' => $plan['duration'],
            'amount' => $plan['amount'],
            'payment_method' => $validated['payment_method'],
            'gateway_number' => $validated['gateway_number'] ?? null,
            'transaction_id' => $validated['transaction_id'] ?? null,
        ];

        $order = $action->handle($orderData);

        // If payment is verified immediately (e.g., cash)
        if (isset($validated['mark_verified']) && $validated['mark_verified']) {
            $payment = $order->payments->first();
            if ($payment) {
                $payment->update([
                    'status' => 'verified',
                    'verified_at' => now(),
                    'verified_by' => (int) (\Illuminate\Support\Facades\Auth::id() ?? 0),
                ]);
            }

            $order->update([
                'status' => 'verified',
            ]);
        }

        return to_route('admin.orders.show', $order->order_number)
            ->with('success', 'Order created successfully.');
    }

    /**
     * Display the specified order.
     */
    public function show(string $orderNumber): Response
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with(['customer', 'payments.verifier'])
            ->firstOrFail();

        return Inertia::render('admin/orders/show', [
            'order' => $order,
            'statuses' => self::STATUSES,
            'paymentMethods' => self::PAYMENT_METHODS,
        ]);
    }

    /**
     * Show the form for editing the specified order.
     */
    public function edit(string $orderNumber): Response
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with(['customer', 'payments'])
            ->firstOrFail();

        return Inertia::render('admin/orders/edit', [
            'order' => $order,
            'statuses' => self::STATUSES,
            'plans' => self::PLANS,
        ]);
    }

    /**
     * Update the specified order.
     */
    public function update(UpdateOrderRequest $request, string $orderNumber): RedirectResponse
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        $validated = $request->validated();

        $order->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
            'subscription_starts_at' => $validated['subscription_starts_at'] ?? null,
            'subscription_ends_at' => $validated['subscription_ends_at'] ?? null,
        ]);

        return back()->with('success', 'Order updated successfully.');
    }

    /**
     * Remove the specified order.
     */
    public function destroy(string $orderNumber): RedirectResponse
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        // Delete associated payments first
        $order->payments()->delete();
        $order->delete();

        return to_route('admin.orders.index')
            ->with('success', 'Order deleted successfully.');
    }
}
