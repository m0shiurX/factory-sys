import Paginator, { PaginationLink } from '@/components/shared/Paginator';
import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    Edit,
    Eye,
    Factory,
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
};

type User = {
    id: number;
    name: string;
};

type Production = {
    id: number;
    pieces_produced: number;
    production_date: string;
    note: string | null;
    product: Product;
    created_by_user: User | null;
    created_at: string;
};

type Stats = {
    total_productions: number;
    today_productions: number;
    total_pieces: number;
    today_pieces: number;
};

type Props = {
    productions: {
        data: Production[];
        links: PaginationLink[];
    };
    stats: Stats;
    filters: {
        search?: string;
    };
};

export default function ProductionsIndex({
    productions,
    stats,
    filters,
}: Props) {
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
                '/dashboard/productions',
                {
                    ...(search && { search }),
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleDelete = (productionId: number) => {
        if (
            confirm(
                'Are you sure you want to delete this production entry? This will reduce the product stock.',
            )
        ) {
            router.delete(`/dashboard/productions/${productionId}`);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatStock = (pieces: number, piecesPerBundle: number) => {
        const bundles = Math.floor(pieces / piecesPerBundle);
        const remaining = pieces % piecesPerBundle;
        if (remaining > 0) {
            return `${bundles} bdl + ${remaining} pcs`;
        }
        return bundles > 0 ? `${bundles} bdl` : `${pieces} pcs`;
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Production
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Track production entries and stock additions
                            </p>
                        </div>
                        <Link
                            href="/dashboard/productions/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Add Production
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-3 gap-4">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Entries
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {stats.total_productions}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <Factory className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Today's Entries
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-emerald-600">
                                        {stats.today_productions}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-emerald-500/10 p-2">
                                    <Calendar className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Pieces Today
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-blue-600">
                                        {stats.today_pieces.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by product name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
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
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Pieces Produced
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Note
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Created By
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {productions.data.map((production) => (
                                    <tr
                                        key={production.id}
                                        className="transition hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-foreground">
                                                {formatDate(
                                                    production.production_date,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {production.product.name}
                                                </p>
                                                {production.product.size && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Size:{' '}
                                                        {
                                                            production.product
                                                                .size
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div>
                                                <p className="text-sm font-semibold text-emerald-600">
                                                    +
                                                    {production.pieces_produced.toLocaleString()}{' '}
                                                    pcs
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatStock(
                                                        production.pieces_produced,
                                                        production.product
                                                            .pieces_per_bundle,
                                                    )}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="max-w-xs truncate text-sm text-muted-foreground">
                                                {production.note || '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                {production.created_by_user
                                                    ?.name || 'System'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/productions/${production.id}`}
                                                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/dashboard/productions/${production.id}/edit`}
                                                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            production.id,
                                                        )
                                                    }
                                                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {productions.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-12 text-center"
                                        >
                                            <Factory className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                No production entries found
                                            </p>
                                            <Link
                                                href="/dashboard/productions/create"
                                                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add your first production entry
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {productions.links.length > 3 && (
                        <div className="mt-6">
                            <Paginator pagination={productions.links} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
