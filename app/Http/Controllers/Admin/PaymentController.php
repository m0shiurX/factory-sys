<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\UpdatePaymentRequest;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Inertia\Controller;
use Inertia\Inertia;
use Inertia\Response;

final class PaymentController extends Controller
{
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
     * Payment status options.
     *
     * @var array<string, string>
     */
    private const array STATUSES = [
        'pending' => 'Pending',
        'verified' => 'Verified',
        'failed' => 'Failed',
        'refunded' => 'Refunded',
    ];

    /**
     * Display a listing of payments.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $method = $request->query('method');
        $search = $request->query('search');

        $query = Payment::query()->with('order');

        if (! empty($status)) {
            $query->where('status', $status);
        }

        if (! empty($method)) {
            $query->where('method', $method);
        }

        if (! empty($search)) {
            $query->where(function (Builder $q) use ($search): void {
                $q->where('transaction_id', 'like', '%'.$search.'%')
                    ->orWhere('gateway_number', 'like', '%'.$search.'%')
                    ->orWhereHas('order', function (Builder $orderQuery) use ($search): void {
                        $orderQuery->where('order_number', 'like', '%'.$search.'%')
                            ->orWhere('customer_name', 'like', '%'.$search.'%')
                            ->orWhere('customer_phone', 'like', '%'.$search.'%');
                    });
            });
        }

        $payments = $query->latest()->paginate(20)->withQueryString();

        // Stats
        $totalPayments = Payment::query()->count();
        $pendingPayments = Payment::query()->where('status', 'pending')->count();
        $verifiedPayments = Payment::query()->where('status', 'verified')->count();
        $totalVerifiedAmount = Payment::query()->where('status', 'verified')->sum('amount');
        $thisMonthPayments = Payment::query()
            ->whereMonth('created_at', Date::now()->month)
            ->whereYear('created_at', Date::now()->year)
            ->count();

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
            'stats' => [
                'total' => $totalPayments,
                'pending' => $pendingPayments,
                'verified' => $verifiedPayments,
                'totalAmount' => $totalVerifiedAmount,
                'thisMonth' => $thisMonthPayments,
            ],
            'statuses' => self::STATUSES,
            'methods' => self::PAYMENT_METHODS,
            'filters' => $request->only(['status', 'method', 'search']),
        ]);
    }

    /**
     * Display the specified payment.
     */
    public function show(Payment $payment): Response
    {
        $payment->load(['order', 'verifier']);

        return Inertia::render('admin/payments/show', [
            'payment' => $payment,
            'statuses' => self::STATUSES,
            'methods' => self::PAYMENT_METHODS,
        ]);
    }

    /**
     * Show the form for editing the specified payment.
     */
    public function edit(Payment $payment): Response
    {
        $payment->load(['order', 'verifier']);

        return Inertia::render('admin/payments/edit', [
            'payment' => $payment,
            'statuses' => self::STATUSES,
            'methods' => self::PAYMENT_METHODS,
        ]);
    }

    /**
     * Update the specified payment.
     */
    public function update(UpdatePaymentRequest $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validated();

        $updateData = [
            'method' => $validated['method'],
            'gateway_number' => $validated['gateway_number'] ?? null,
            'transaction_id' => $validated['transaction_id'] ?? null,
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
        ];

        // If marking as verified
        if ($validated['status'] === 'verified' && $payment->status !== 'verified') {
            $updateData['verified_at'] = now();
            $updateData['verified_by'] = auth()->id();

            // Also update order status to verified if pending
            if ($payment->order && $payment->order->status === 'pending') {
                $payment->order->update(['status' => 'verified']);
            }
        }

        // If unmarking verification
        if ($validated['status'] !== 'verified' && $payment->status === 'verified') {
            $updateData['verified_at'] = null;
            $updateData['verified_by'] = null;
        }

        $payment->update($updateData);

        return back()->with('success', 'Payment updated successfully.');
    }

    /**
     * Quick verify a payment.
     */
    public function verify(Payment $payment): RedirectResponse
    {
        if ($payment->status === 'verified') {
            return back()->with('error', 'Payment is already verified.');
        }

        $payment->update([
            'status' => 'verified',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        // Update order status
        if ($payment->order && $payment->order->status === 'pending') {
            $payment->order->update(['status' => 'verified']);
        }

        return back()->with('success', 'Payment verified successfully.');
    }
}
