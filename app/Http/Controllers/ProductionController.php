<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductionRequest;
use App\Http\Requests\UpdateProductionRequest;
use App\Models\Product;
use App\Models\Production;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class ProductionController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Production::query()
            ->with(['product:id,name,size,pieces_per_bundle', 'createdBy:id,name'])
            ->latest('production_date')
            ->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = $request->string('search')->trim()->value();
            $query->whereHas('product', fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('size', 'like', "%{$search}%"));
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->integer('product_id'));
        }

        if ($request->filled('from_date')) {
            $query->whereDate('production_date', '>=', $request->string('from_date')->value());
        }

        if ($request->filled('to_date')) {
            $query->whereDate('production_date', '<=', $request->string('to_date')->value());
        }

        $productions = $query->paginate(15)->withQueryString();

        // Stats
        $stats = [
            'total_productions' => Production::query()->count(),
            'today_productions' => Production::query()->whereDate('production_date', today())->count(),
            'total_pieces' => (int) Production::query()->sum('pieces_produced'),
            'today_pieces' => (int) Production::query()->whereDate('production_date', today())->sum('pieces_produced'),
        ];

        return Inertia::render('admin/productions/index', [
            'productions' => $productions,
            'stats' => $stats,
            'filters' => $request->only(['search', 'product_id', 'from_date', 'to_date']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $products = Product::query()
            ->where('is_active', true)
            ->select(['id', 'name', 'size', 'pieces_per_bundle', 'stock_pieces'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/productions/create', [
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated): void {
            // Create the production record
            Production::query()->create([
                'product_id' => $validated['product_id'],
                'pieces_produced' => $validated['pieces_produced'],
                'production_date' => $validated['production_date'],
                'note' => $validated['note'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Increase stock
            Product::query()->where('id', $validated['product_id'])
                ->increment('stock_pieces', $validated['pieces_produced']);
        });

        return to_route('productions.index')
            ->with('success', 'Production recorded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Production $production): Response
    {
        $production->load([
            'product:id,name,size,pieces_per_bundle,stock_pieces',
            'createdBy:id,name',
        ]);

        return Inertia::render('admin/productions/show', [
            'production' => $production,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Production $production): Response
    {
        $production->load('product:id,name,size');

        $products = Product::query()
            ->where('is_active', true)
            ->select(['id', 'name', 'size', 'pieces_per_bundle', 'stock_pieces'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/productions/edit', [
            'production' => $production,
            'products' => $products,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductionRequest $request, Production $production): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $production): void {
            $oldPieces = $production->pieces_produced;
            $newPieces = $validated['pieces_produced'];

            // Adjust stock for the difference
            $difference = $newPieces - $oldPieces;
            if ($difference !== 0) {
                Product::query()->where('id', $production->product_id)
                    ->increment('stock_pieces', $difference);
            }

            // Update production
            $production->update([
                'pieces_produced' => $newPieces,
                'production_date' => $validated['production_date'],
                'note' => $validated['note'] ?? null,
            ]);
        });

        return to_route('productions.show', $production)
            ->with('success', 'Production updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Production $production): RedirectResponse
    {
        DB::transaction(function () use ($production): void {
            // Reduce stock
            Product::query()->where('id', $production->product_id)
                ->decrement('stock_pieces', $production->pieces_produced);

            $production->delete();
        });

        return to_route('productions.index')
            ->with('success', 'Production deleted successfully.');
    }
}
