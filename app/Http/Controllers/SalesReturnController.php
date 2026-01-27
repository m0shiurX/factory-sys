<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreSalesReturnRequest;
use App\Http\Requests\UpdateSalesReturnRequest;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SalesReturn;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class SalesReturnController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = SalesReturn::query()
            ->with(['customer:id,name,phone', 'sale:id,bill_no', 'createdBy:id,name'])
            ->latest('return_date')
            ->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = $request->string('search')->trim()->value();
            $query->where(function ($q) use ($search): void {
                $q->where('return_no', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('from_date')) {
            $query->whereDate('return_date', '>=', $request->string('from_date')->value());
        }

        if ($request->filled('to_date')) {
            $query->whereDate('return_date', '<=', $request->string('to_date')->value());
        }

        $returns = $query->paginate(15)->withQueryString();

        // Stats
        $stats = [
            'total_returns' => SalesReturn::query()->count(),
            'today_returns' => SalesReturn::query()->whereDate('return_date', today())->count(),
            'total_amount' => (float) SalesReturn::query()->sum('grand_total'),
            'this_month_amount' => (float) SalesReturn::query()->whereMonth('return_date', now()->month)
                ->whereYear('return_date', now()->year)
                ->sum('grand_total'),
        ];

        return Inertia::render('admin/sales-returns/index', [
            'returns' => $returns,
            'stats' => $stats,
            'filters' => $request->only(['search', 'from_date', 'to_date']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $sale = null;
        if ($request->filled('sale_id')) {
            $sale = Sale::with(['customer:id,name,phone,address', 'items.product:id,name,size,pieces_per_bundle,rate_per_kg'])
                ->find($request->input('sale_id'));
        }

        return Inertia::render('admin/sales-returns/create', [
            'return_no' => SalesReturn::generateReturnNo(),
            'sale' => $sale,
            'customers' => Customer::query()
                ->where('is_active', true)
                ->select(['id', 'name', 'phone', 'address'])
                ->orderBy('name')
                ->get(),
            'products' => Product::query()
                ->where('is_active', true)
                ->select(['id', 'name', 'size', 'pieces_per_bundle', 'rate_per_kg', 'stock_pieces'])
                ->orderBy('name')
                ->get(),
            'sales' => Sale::query()
                ->with('customer:id,name')
                ->latest('sale_date')
                ->take(100)
                ->get(['id', 'bill_no', 'customer_id', 'sale_date', 'net_amount']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSalesReturnRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $salesReturn = DB::transaction(function () use ($validated): SalesReturn {
            // Create the sales return
            $return = SalesReturn::query()->create([
                'return_no' => $validated['return_no'],
                'customer_id' => $validated['customer_id'],
                'sale_id' => $validated['sale_id'] ?? null,
                'return_date' => $validated['return_date'],
                'total_weight' => $validated['total_weight'],
                'sub_total' => $validated['sub_total'],
                'discount' => $validated['discount'] ?? 0,
                'grand_total' => $validated['grand_total'],
                'note' => $validated['note'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Create return items and restore stock
            foreach ($validated['items'] as $item) {
                $return->items()->create([
                    'product_id' => $item['product_id'],
                    'bundles' => $item['bundles'],
                    'extra_pieces' => $item['extra_pieces'],
                    'total_pieces' => $item['total_pieces'],
                    'weight_kg' => $item['weight_kg'],
                    'rate_per_kg' => $item['rate_per_kg'],
                    'sub_total' => $item['sub_total'],
                ]);

                // Restore stock (add back to inventory)
                Product::query()->where('id', $item['product_id'])
                    ->increment('stock_pieces', $item['total_pieces']);
            }

            // Reduce customer total_due (they owe less now)
            Customer::query()->where('id', $validated['customer_id'])
                ->decrement('total_due', $validated['grand_total']);

            return $return;
        });

        return to_route('sales-returns.show', $salesReturn)
            ->with('success', 'Sales return recorded successfully.')
            ->with('auto_print', true);
    }

    /**
     * Display the specified resource.
     */
    public function show(SalesReturn $salesReturn): Response
    {
        $salesReturn->load([
            'customer:id,name,phone,address,total_due',
            'sale:id,bill_no,sale_date',
            'items.product:id,name,size,pieces_per_bundle',
            'createdBy:id,name',
        ]);

        return Inertia::render('admin/sales-returns/show', [
            'salesReturn' => $salesReturn,
            'auto_print' => session('auto_print', false),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SalesReturn $salesReturn): Response
    {
        $salesReturn->load(['customer:id,name,phone,address', 'sale', 'items.product']);

        return Inertia::render('admin/sales-returns/edit', [
            'salesReturn' => $salesReturn,
            'customers' => Customer::query()
                ->where('is_active', true)
                ->select(['id', 'name', 'phone', 'address'])
                ->orderBy('name')
                ->get(),
            'products' => Product::query()
                ->where('is_active', true)
                ->select(['id', 'name', 'size', 'pieces_per_bundle', 'rate_per_kg', 'stock_pieces'])
                ->orderBy('name')
                ->get(),
            'sales' => Sale::query()
                ->with('customer:id,name')
                ->latest('sale_date')
                ->take(100)
                ->get(['id', 'bill_no', 'customer_id', 'sale_date', 'net_amount']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSalesReturnRequest $request, SalesReturn $salesReturn): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $salesReturn): void {
            // Reverse old stock changes and customer due adjustment
            foreach ($salesReturn->items as $oldItem) {
                Product::query()->where('id', $oldItem->product_id)
                    ->decrement('stock_pieces', $oldItem->total_pieces);
            }
            Customer::query()->where('id', $salesReturn->customer_id)
                ->increment('total_due', $salesReturn->grand_total);

            // Update return
            $salesReturn->update([
                'customer_id' => $validated['customer_id'],
                'sale_id' => $validated['sale_id'] ?? null,
                'return_date' => $validated['return_date'],
                'total_weight' => $validated['total_weight'],
                'sub_total' => $validated['sub_total'],
                'discount' => $validated['discount'] ?? 0,
                'grand_total' => $validated['grand_total'],
                'note' => $validated['note'] ?? null,
            ]);

            // Delete old items and create new ones
            $salesReturn->items()->delete();

            foreach ($validated['items'] as $item) {
                $salesReturn->items()->create([
                    'product_id' => $item['product_id'],
                    'bundles' => $item['bundles'],
                    'extra_pieces' => $item['extra_pieces'],
                    'total_pieces' => $item['total_pieces'],
                    'weight_kg' => $item['weight_kg'],
                    'rate_per_kg' => $item['rate_per_kg'],
                    'sub_total' => $item['sub_total'],
                ]);

                // Restore stock
                Product::query()->where('id', $item['product_id'])
                    ->increment('stock_pieces', $item['total_pieces']);
            }

            // Reduce customer due
            Customer::query()->where('id', $validated['customer_id'])
                ->decrement('total_due', $validated['grand_total']);
        });

        return to_route('sales-returns.show', $salesReturn)
            ->with('success', 'Sales return updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SalesReturn $salesReturn): RedirectResponse
    {
        DB::transaction(function () use ($salesReturn): void {
            // Reverse stock changes (remove from inventory)
            foreach ($salesReturn->items as $item) {
                Product::query()->where('id', $item->product_id)
                    ->decrement('stock_pieces', $item->total_pieces);
            }

            // Restore customer due
            Customer::query()->where('id', $salesReturn->customer_id)
                ->increment('total_due', $salesReturn->grand_total);

            // Delete the return and its items
            $salesReturn->delete();
        });

        return to_route('sales-returns.index')
            ->with('success', 'Sales return deleted successfully.');
    }
}
