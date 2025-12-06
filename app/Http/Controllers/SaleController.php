<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Models\Customer;
use App\Models\PaymentType;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class SaleController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Sale::query()
            ->with(['customer:id,name,phone,address,total_due', 'paymentType:id,name'])
            ->latest('sale_date')
            ->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = $request->string('search')->trim()->value();
            $query->where(function ($q) use ($search): void {
                $q->where('bill_no', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('from_date')) {
            $query->whereDate('sale_date', '>=', $request->string('from_date')->value());
        }

        if ($request->filled('to_date')) {
            $query->whereDate('sale_date', '<=', $request->string('to_date')->value());
        }

        $sales = $query->paginate(15)->withQueryString();

        // Stats
        $stats = [
            'total_sales' => Sale::query()->count(),
            'today_sales' => Sale::query()->whereDate('sale_date', today())->count(),
            'total_amount' => (float) Sale::query()->sum('net_amount'),
            'total_due' => (float) Sale::query()->sum('due_amount'),
        ];

        return Inertia::render('admin/sales/index', [
            'sales' => $sales,
            'stats' => $stats,
            'filters' => $request->only(['search', 'from_date', 'to_date']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/sales/create', [
            'bill_no' => Sale::generateBillNo(),
            'customers' => Customer::query()
                ->where('is_active', true)
                ->select(['id', 'name', 'phone', 'address', 'total_due', 'credit_limit'])
                ->orderBy('name')
                ->get(),
            'products' => Product::query()
                ->where('is_active', true)
                ->select(['id', 'name', 'size', 'pieces_per_bundle', 'rate_per_kg', 'stock_pieces'])
                ->orderBy('name')
                ->get(),
            'payment_types' => PaymentType::query()
                ->where('is_active', true)
                ->select(['id', 'name'])
                ->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSaleRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated): void {
            // Create the sale
            $sale = Sale::query()->create([
                'bill_no' => $validated['bill_no'],
                'customer_id' => $validated['customer_id'],
                'sale_date' => $validated['sale_date'],
                'total_pieces' => $validated['total_pieces'],
                'total_weight_kg' => $validated['total_weight_kg'],
                'total_amount' => $validated['total_amount'],
                'discount' => $validated['discount'] ?? 0,
                'net_amount' => $validated['net_amount'],
                'paid_amount' => $validated['paid_amount'] ?? 0,
                'due_amount' => $validated['due_amount'],
                'payment_type_id' => $validated['payment_type_id'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Create sale items and update stock
            foreach ($validated['items'] as $item) {
                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'bundles' => $item['bundles'],
                    'extra_pieces' => $item['extra_pieces'],
                    'total_pieces' => $item['total_pieces'],
                    'weight_kg' => $item['weight_kg'],
                    'rate_per_kg' => $item['rate_per_kg'],
                    'amount' => $item['amount'],
                ]);

                // Deduct stock
                Product::query()->where('id', $item['product_id'])
                    ->decrement('stock_pieces', $item['total_pieces']);
            }

            // Update customer total_due
            Customer::query()->where('id', $validated['customer_id'])
                ->increment('total_due', $validated['due_amount']);
        });

        return to_route('sales.index')
            ->with('success', 'Sale created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale): Response
    {
        $sale->load([
            'customer:id,name,phone,address,total_due',
            'items.product:id,name,size,pieces_per_bundle',
            'paymentType:id,name',
            'createdBy:id,name',
        ]);

        return Inertia::render('admin/sales/show', [
            'sale' => $sale,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sale $sale): Response
    {
        $sale->load(['customer:id,name,phone,address,total_due', 'items.product']);

        return Inertia::render('admin/sales/edit', [
            'sale' => $sale,
            'customers' => Customer::query()
                ->where('is_active', true)
                ->select(['id', 'name', 'phone', 'address', 'total_due', 'credit_limit'])
                ->orderBy('name')
                ->get(),
            'products' => Product::query()
                ->where('is_active', true)
                ->select(['id', 'name', 'size', 'pieces_per_bundle', 'rate_per_kg', 'stock_pieces'])
                ->orderBy('name')
                ->get(),
            'payment_types' => PaymentType::query()
                ->where('is_active', true)
                ->select(['id', 'name'])
                ->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSaleRequest $request, Sale $sale): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $sale): void {
            // Restore old stock and customer due
            foreach ($sale->items as $oldItem) {
                Product::query()->where('id', $oldItem->product_id)
                    ->increment('stock_pieces', $oldItem->total_pieces);
            }
            Customer::query()->where('id', $sale->customer_id)
                ->decrement('total_due', $sale->due_amount);

            // Update sale
            $sale->update([
                'customer_id' => $validated['customer_id'],
                'sale_date' => $validated['sale_date'],
                'total_pieces' => $validated['total_pieces'],
                'total_weight_kg' => $validated['total_weight_kg'],
                'total_amount' => $validated['total_amount'],
                'discount' => $validated['discount'] ?? 0,
                'net_amount' => $validated['net_amount'],
                'paid_amount' => $validated['paid_amount'] ?? 0,
                'due_amount' => $validated['due_amount'],
                'payment_type_id' => $validated['payment_type_id'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Delete old items and create new ones
            $sale->items()->delete();

            foreach ($validated['items'] as $item) {
                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'bundles' => $item['bundles'],
                    'extra_pieces' => $item['extra_pieces'],
                    'total_pieces' => $item['total_pieces'],
                    'weight_kg' => $item['weight_kg'],
                    'rate_per_kg' => $item['rate_per_kg'],
                    'amount' => $item['amount'],
                ]);

                // Deduct new stock
                Product::query()->where('id', $item['product_id'])
                    ->decrement('stock_pieces', $item['total_pieces']);
            }

            // Update customer total_due with new amount
            Customer::query()->where('id', $validated['customer_id'])
                ->increment('total_due', $validated['due_amount']);
        });

        return to_route('sales.index')
            ->with('success', 'Sale updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale): RedirectResponse
    {
        DB::transaction(function () use ($sale): void {
            // Restore stock
            foreach ($sale->items as $item) {
                Product::query()->where('id', $item->product_id)
                    ->increment('stock_pieces', $item->total_pieces);
            }

            // Reduce customer due
            Customer::query()->where('id', $sale->customer_id)
                ->decrement('total_due', $sale->due_amount);

            // Delete items and sale
            $sale->items()->delete();
            $sale->delete();
        });

        return to_route('sales.index')
            ->with('success', 'Sale deleted successfully.');
    }
}
