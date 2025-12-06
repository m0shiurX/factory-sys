<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ProductController
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): Response
    {
        $query = Product::query();

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('size', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $products = $query->orderBy('name')
            ->orderBy('size')
            ->paginate(15)
            ->withQueryString();

        // Calculate stats
        $stats = [
            'total' => Product::count(),
            'active' => Product::where('is_active', true)->count(),
            'low_stock' => Product::whereColumn('stock_pieces', '<=', 'min_stock_alert')
                ->where('min_stock_alert', '>', 0)
                ->count(),
        ];

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'stats' => $stats,
            'filters' => $request->only(['search', 'active']),
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
        return Inertia::render('admin/products/create');
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'size' => ['nullable', 'string', 'max:100'],
            'pieces_per_bundle' => ['required', 'integer', 'min:1'],
            'rate_per_kg' => ['required', 'numeric', 'min:0'],
            'stock_pieces' => ['required', 'integer', 'min:0'],
            'min_stock_alert' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['min_stock_alert'] = $validated['min_stock_alert'] ?? 0;

        Product::create($validated);

        return to_route('products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): Response
    {
        return Inertia::render('admin/products/show', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/edit', [
            'product' => $product,
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'size' => ['nullable', 'string', 'max:100'],
            'pieces_per_bundle' => ['required', 'integer', 'min:1'],
            'rate_per_kg' => ['required', 'numeric', 'min:0'],
            'stock_pieces' => ['required', 'integer', 'min:0'],
            'min_stock_alert' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $product->update($validated);

        return to_route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return to_route('products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
