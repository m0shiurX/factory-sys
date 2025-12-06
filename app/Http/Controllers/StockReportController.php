<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Production;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class StockReportController
{
    public function index(Request $request): Response
    {
        $query = Product::query()
            ->where('is_active', true);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('size', 'like', "%{$search}%");
            });
        }

        // Filter by stock status
        if ($request->input('filter') === 'low') {
            $query->whereColumn('stock_pieces', '<=', 'min_stock_alert')
                ->where('min_stock_alert', '>', 0);
        } elseif ($request->input('filter') === 'out') {
            $query->where('stock_pieces', 0);
        }

        $products = $query
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        // Calculate stats
        $totalProducts = Product::query()->where('is_active', true)->count();
        $lowStockCount = Product::query()->where('is_active', true)
            ->whereColumn('stock_pieces', '<=', 'min_stock_alert')
            ->where('min_stock_alert', '>', 0)
            ->count();
        $outOfStockCount = Product::query()->where('is_active', true)
            ->where('stock_pieces', 0)
            ->count();
        $totalStockPieces = Product::query()->where('is_active', true)->sum('stock_pieces');

        // Recent production entries (last 7 days)
        $recentProduction = Production::query()
            ->with('product:id,name,size')
            ->where('production_date', '>=', now()->subDays(7))
            ->latest('production_date')
            ->limit(5)
            ->get();

        return Inertia::render('admin/stock/index', [
            'products' => $products,
            'stats' => [
                'total_products' => $totalProducts,
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
                'total_stock_pieces' => $totalStockPieces,
            ],
            'recent_production' => $recentProduction,
            'filters' => [
                'search' => $request->input('search'),
                'filter' => $request->input('filter'),
            ],
        ]);
    }
}
