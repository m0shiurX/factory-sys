import Paginator, { PaginationLink } from '@/components/shared/Paginator';
import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Box,
    CheckCircle2,
    Edit,
    Eye,
    Package,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Product = {
    id: number;
    name: string;
    size: string | null;
    pieces_per_bundle: number;
    rate_per_kg: number;
    stock_pieces: number;
    min_stock_alert: number;
    is_active: boolean;
    created_at: string;
};

type Stats = {
    total: number;
    active: number;
    low_stock: number;
};

type Props = {
    products: {
        data: Product[];
        links: PaginationLink[];
    };
    stats: Stats;
    filters: {
        search?: string;
        active?: string;
    };
};

export default function ProductsIndex({ products, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const { props } = usePage<{
        flash?: { success?: string; error?: string };
    }>();

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash?.success, props.flash?.error]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                '/dashboard/products',
                {
                    ...(search && { search }),
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleDelete = (productId: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/dashboard/products/${productId}`);
        }
    };

    const formatStock = (pieces: number, piecesPerBundle: number) => {
        const bundles = Math.floor(pieces / piecesPerBundle);
        const remaining = pieces % piecesPerBundle;
        if (remaining > 0) {
            return `${bundles} bdl + ${remaining} pcs`;
        }
        return `${bundles} bdl`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const isLowStock = (product: Product) => {
        return (
            product.min_stock_alert > 0 &&
            product.stock_pieces <= product.min_stock_alert
        );
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Products
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage your product catalog
                            </p>
                        </div>
                        <Link
                            href="/dashboard/products/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Add Product
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-3 gap-4">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Products
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {stats.total}
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
                                        Active Products
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-emerald-600">
                                        {stats.active}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-emerald-500/10 p-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Low Stock
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-amber-600">
                                        {stats.low_stock}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-amber-500/10 p-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Pcs/Bundle
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Rate/kg
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Stock
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {products.data.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="transition hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-muted p-2">
                                                    <Box className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {product.name}
                                                    </p>
                                                    {product.size && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {product.size}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-foreground">
                                            {product.pieces_per_bundle}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                                            {formatCurrency(product.rate_per_kg)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${isLowStock(product)
                                                        ? 'bg-amber-500/10 text-amber-600'
                                                        : 'bg-muted text-muted-foreground'
                                                    }`}
                                            >
                                                {isLowStock(product) && (
                                                    <AlertTriangle className="h-3 w-3" />
                                                )}
                                                {formatStock(
                                                    product.stock_pieces,
                                                    product.pieces_per_bundle,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${product.is_active
                                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                                        : 'border-border bg-muted text-muted-foreground'
                                                    }`}
                                            >
                                                {product.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/dashboard/products/${product.id}`}
                                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/dashboard/products/${product.id}/edit`}
                                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(product.id)
                                                    }
                                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {products.data.length === 0 && (
                            <div className="py-12 text-center">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    No products found
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {products.links.length > 3 && (
                        <div className="mt-6">
                            <Paginator pagination={products.links} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
