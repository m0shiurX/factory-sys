<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\PaymentType;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class PaymentController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Payment::query()
            ->with(['customer:id,name,phone', 'paymentType:id,name', 'sale:id,bill_no'])
            ->latest('payment_date')
            ->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = $request->string('search')->trim()->value();
            $query->where(function ($q) use ($search): void {
                $q->where('payment_ref', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('sale', fn ($sq) => $sq->where('bill_no', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('from_date')) {
            $query->whereDate('payment_date', '>=', $request->string('from_date')->value());
        }

        if ($request->filled('to_date')) {
            $query->whereDate('payment_date', '<=', $request->string('to_date')->value());
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->integer('customer_id'));
        }

        $payments = $query->paginate(15)->withQueryString();

        // Stats
        $stats = [
            'total_payments' => Payment::query()->count(),
            'today_payments' => Payment::query()->whereDate('payment_date', today())->count(),
            'total_amount' => (float) Payment::query()->sum('amount'),
            'today_amount' => (float) Payment::query()->whereDate('payment_date', today())->sum('amount'),
        ];

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only(['search', 'from_date', 'to_date', 'customer_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $customers = Customer::query()
            ->where('is_active', true)
            ->where('total_due', '>', 0)
            ->select(['id', 'name', 'phone', 'address', 'total_due'])
            ->orderBy('name')
            ->get();

        $sales = [];
        if ($request->filled('customer_id')) {
            $sales = Sale::query()
                ->where('customer_id', $request->integer('customer_id'))
                ->where('due_amount', '>', 0)
                ->select(['id', 'bill_no', 'sale_date', 'net_amount', 'paid_amount', 'due_amount'])
                ->latest('sale_date')
                ->get();
        }

        return Inertia::render('admin/payments/create', [
            'customers' => $customers,
            'sales' => $sales,
            'payment_types' => PaymentType::query()
                ->where('is_active', true)
                ->select(['id', 'name'])
                ->get(),
            'selected_customer_id' => $request->integer('customer_id'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated): void {
            // Create the payment
            Payment::query()->create([
                'customer_id' => $validated['customer_id'],
                'sale_id' => $validated['sale_id'] ?? null,
                'amount' => $validated['amount'],
                'payment_type_id' => $validated['payment_type_id'] ?? null,
                'payment_ref' => $validated['payment_ref'] ?? null,
                'payment_date' => $validated['payment_date'],
                'note' => $validated['note'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Reduce customer total_due
            Customer::query()->where('id', $validated['customer_id'])
                ->decrement('total_due', $validated['amount']);

            // If linked to a sale, update the sale's paid_amount and due_amount
            if (! empty($validated['sale_id'])) {
                /** @var Sale|null $sale */
                $sale = Sale::query()->find($validated['sale_id']);
                if ($sale instanceof Sale) {
                    $newPaid = (float) $sale->paid_amount + (float) $validated['amount'];
                    $newDue = (float) $sale->net_amount - $newPaid;
                    $sale->update([
                        'paid_amount' => $newPaid,
                        'due_amount' => max(0, $newDue),
                    ]);
                }
            }
        });

        return to_route('payments.index')
            ->with('success', 'Payment recorded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment): Response
    {
        $payment->load([
            'customer:id,name,phone,address,total_due',
            'sale:id,bill_no,sale_date,net_amount,paid_amount,due_amount',
            'paymentType:id,name',
            'createdBy:id,name',
        ]);

        return Inertia::render('admin/payments/show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Payment $payment): Response
    {
        $payment->load(['customer:id,name,phone,address,total_due', 'sale:id,bill_no']);

        $customers = Customer::query()
            ->where('is_active', true)
            ->select(['id', 'name', 'phone', 'address', 'total_due'])
            ->orderBy('name')
            ->get();

        $sales = Sale::query()
            ->where('customer_id', $payment->customer_id)
            ->select(['id', 'bill_no', 'sale_date', 'net_amount', 'paid_amount', 'due_amount'])
            ->latest('sale_date')
            ->get();

        return Inertia::render('admin/payments/edit', [
            'payment' => $payment,
            'customers' => $customers,
            'sales' => $sales,
            'payment_types' => PaymentType::query()
                ->where('is_active', true)
                ->select(['id', 'name'])
                ->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePaymentRequest $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $payment): void {
            $oldAmount = (float) $payment->amount;
            $newAmount = (float) $validated['amount'];
            $amountDiff = $newAmount - $oldAmount;

            // Restore old customer due then apply new
            Customer::query()->where('id', $payment->customer_id)
                ->increment('total_due', $oldAmount);
            Customer::query()->where('id', $validated['customer_id'])
                ->decrement('total_due', $newAmount);

            // If old sale was linked, restore its due
            if ($payment->sale_id) {
                /** @var Sale|null $oldSale */
                $oldSale = Sale::query()->find($payment->sale_id);
                if ($oldSale instanceof Sale) {
                    $oldSale->update([
                        'paid_amount' => (float) $oldSale->paid_amount - $oldAmount,
                        'due_amount' => (float) $oldSale->due_amount + $oldAmount,
                    ]);
                }
            }

            // Update payment
            $payment->update([
                'customer_id' => $validated['customer_id'],
                'sale_id' => $validated['sale_id'] ?? null,
                'amount' => $newAmount,
                'payment_type_id' => $validated['payment_type_id'] ?? null,
                'payment_ref' => $validated['payment_ref'] ?? null,
                'payment_date' => $validated['payment_date'],
                'note' => $validated['note'] ?? null,
            ]);

            // If new sale is linked, update its paid/due
            if (! empty($validated['sale_id'])) {
                /** @var Sale|null $newSale */
                $newSale = Sale::query()->find($validated['sale_id']);
                if ($newSale instanceof Sale) {
                    $newSale->update([
                        'paid_amount' => (float) $newSale->paid_amount + $newAmount,
                        'due_amount' => max(0, (float) $newSale->due_amount - $newAmount),
                    ]);
                }
            }
        });

        return to_route('payments.index')
            ->with('success', 'Payment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment): RedirectResponse
    {
        DB::transaction(function () use ($payment): void {
            // Restore customer due
            Customer::query()->where('id', $payment->customer_id)
                ->increment('total_due', $payment->amount);

            // Restore sale due if linked
            if ($payment->sale_id) {
                /** @var Sale|null $sale */
                $sale = Sale::query()->find($payment->sale_id);
                if ($sale instanceof Sale) {
                    $sale->update([
                        'paid_amount' => (float) $sale->paid_amount - (float) $payment->amount,
                        'due_amount' => (float) $sale->due_amount + (float) $payment->amount,
                    ]);
                }
            }

            $payment->delete();
        });

        return to_route('payments.index')
            ->with('success', 'Payment deleted successfully.');
    }
}
