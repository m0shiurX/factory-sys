import Paginator, { PaginationLink } from '@/components/shared/Paginator';
import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    Box,
    Eye,
    Factory,
    Package,
    Search,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Product = {
    id: number;
    name: string;
    size: string | null;
    pieces_per_bundle: number;
    rate_per_kg: number;
    stock_pieces: number;
    min_stock_alert: number;
};

type RecentProduction = {
    id: number;
    pieces_produced: number;
    production_date: string;
    product: {
        id: number;
        name: string;
        size: string | null;
    };
};

type Stats = {
    total_products: number;
    low_stock_count: number;
    out_of_stock_count: number;
    total_stock_pieces: number;
};

type Props = {
    products: {
        data: Product[];
        links: PaginationLink[];
    };
    stats: Stats;
    recent_production: RecentProduction[];
    filters: {
        search?: string;
        filter?: string;
    };
};

export default function StockIndex({
    products,
    stats,
    recent_production,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                '/dashboard/stock',
                {
                    ...(search && { search }),
                    ...(filters.filter && { filter: filters.filter }),
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const handleFilterChange = (filter: string | null) => {
        router.get(
            '/dashboard/stock',
            {
                ...(search && { search }),
                ...(filter && { filter }),
            },
            { preserveState: true, replace: true },
        );
    };

    const formatStock = (pieces: number, piecesPerBundle: number) => {
        const bundles = Math.floor(pieces / piecesPerBundle);
        const remaining = pieces % piecesPerBundle;
        if (remaining > 0) {
            return `${bundles} bdl + ${remaining} pcs`;
        }
        return bundles > 0 ? `${bundles} bdl` : `${pieces} pcs`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-BD', {
            month: 'short',
            day: 'numeric',
        });
    };

    const isLowStock = (product: Product) => {
        return (
            product.min_stock_alert > 0 &&
            product.stock_pieces <= product.min_stock_alert &&
            product.stock_pieces > 0
        );
    };

    const isOutOfStock = (product: Product) => {
        return product.stock_pieces === 0;
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Stock Report
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Monitor product stock levels and production
                            </p>
                        </div>
                        <Link
                            href="/dashboard/productions/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Factory className="h-4 w-4" />
                            Add Production
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Products
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {stats.total_products}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Stock
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-blue-600">
                                        {stats.total_stock_pieces.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        pieces
                                    </p>
                                </div>
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <Box className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() =>
                                handleFilterChange(
                                    filters.filter === 'low' ? null : 'low',
                                )
                            }
                            className={`rounded-xl border p-4 text-left transition ${filters.filter === 'low'
                                    ? 'border-amber-500 bg-amber-500/10'
                                    : 'border-border bg-card hover:border-amber-500/50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Low Stock
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-amber-600">
                                        {stats.low_stock_count}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-amber-500/10 p-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={() =>
                                handleFilterChange(
                                    filters.filter === 'out' ? null : 'out',
                                )
                            }
                            className={`rounded-xl border p-4 text-left transition ${filters.filter === 'out'
                                    ? 'border-red-500 bg-red-500/10'
                                    : 'border-border bg-card hover:border-red-500/50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Out of Stock
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-red-600">
                                        {stats.out_of_stock_count}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-red-500/10 p-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Stock Table */}
                        <div className="lg:col-span-2">
                            {/* Search */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-border bg-card py-2.5 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-hidden rounded-xl border border-border bg-card">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Product
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Stock
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {products.data.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="transition hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {product.name}
                                                        </p>
                                                        {product.size && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Size:{' '}
                                                                {product.size}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {product.stock_pieces.toLocaleString()}{' '}
                                                            pcs
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatStock(
                                                                product.stock_pieces,
                                                                product.pieces_per_bundle,
                                                            )}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {isOutOfStock(product) ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600">
                                                            <XCircle className="h-3 w-3" />
                                                            Out of Stock
                                                        </span>
                                                    ) : isLowStock(product) ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600">
                                                            In Stock
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={`/dashboard/products/${product.id}`}
                                                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {products.data.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-12 text-center"
                                                >
                                                    <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        No products found
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {products.links.length > 3 && (
                                <div className="mt-4">
                                    <Paginator pagination={products.links} />
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Recent Production */}
                        <div className="lg:col-span-1">
                            <div className="rounded-xl border border-border bg-card">
                                <div className="flex items-center justify-between border-b border-border p-4">
                                    <h3 className="font-medium text-foreground">
                                        Recent Production
                                    </h3>
                                    <Link
                                        href="/dashboard/productions"
                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                        View All
                                        <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </div>
                                <div className="divide-y divide-border">
                                    {recent_production.map((production) => (
                                        <Link
                                            key={production.id}
                                            href={`/dashboard/productions/${production.id}`}
                                            className="flex items-center gap-3 p-4 transition hover:bg-muted/50"
                                        >
                                            <div className="rounded-lg bg-emerald-500/10 p-2">
                                                <Factory className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {production.product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    +
                                                    {production.pieces_produced}{' '}
                                                    pcs
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(
                                                    production.production_date,
                                                )}
                                            </span>
                                        </Link>
                                    ))}
                                    {recent_production.length === 0 && (
                                        <div className="p-6 text-center">
                                            <Factory className="mx-auto h-8 w-8 text-muted-foreground/50" />
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                No recent production
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
