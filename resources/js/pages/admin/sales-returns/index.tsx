import Paginator, { PaginationLink } from '@/components/shared/Paginator';
import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    Eye,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    TrendingDown,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
};

type Sale = {
    id: number;
    bill_no: string;
};

type User = {
    id: number;
    name: string;
};

type SalesReturn = {
    id: number;
    return_no: string;
    return_date: string;
    is_scrap_purchase: boolean;
    total_weight: number;
    grand_total: number;
    customer: Customer;
    sale: Sale | null;
    created_by: User | null;
    created_at: string;
};

type Stats = {
    total_returns: number;
    today_returns: number;
    total_amount: number;
    this_month_amount: number;
};

type Props = {
    returns: {
        data: SalesReturn[];
        links: PaginationLink[];
    };
    stats: Stats;
    filters: {
        search?: string;
        from_date?: string;
        to_date?: string;
    };
};

export default function SalesReturnsIndex({ returns, stats, filters }: Props) {
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
                '/dashboard/sales-returns',
                {
                    ...(search && { search }),
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleDelete = (returnId: number) => {
        if (
            confirm(
                'Are you sure you want to delete this return? This will reverse stock and customer due adjustments.',
            )
        ) {
            router.delete(`/dashboard/sales-returns/${returnId}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Sales Returns
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage product returns from customers
                            </p>
                        </div>
                        <Link
                            href="/dashboard/sales-returns/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            New Return
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Returns
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {stats.total_returns}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <RotateCcw className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Today's Returns
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-amber-600">
                                        {stats.today_returns}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-amber-500/10 p-2">
                                    <Calendar className="h-5 w-5 text-amber-600" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Amount
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-red-600">
                                        {formatCurrency(stats.total_amount)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-red-500/10 p-2">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        This Month
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-orange-600">
                                        {formatCurrency(
                                            stats.this_month_amount,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-orange-500/10 p-2">
                                    <Calendar className="h-5 w-5 text-orange-600" />
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
                                placeholder="Search by return no or customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-border bg-card py-2.5 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Returns List */}
                    <div className="space-y-3">
                        {returns.data.length === 0 ? (
                            <div className="rounded-xl border border-border bg-card p-12 text-center">
                                <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium text-foreground">
                                    No returns found
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Record a new return when products are
                                    returned.
                                </p>
                                <Link
                                    href="/dashboard/sales-returns/create"
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Return
                                </Link>
                            </div>
                        ) : (
                            returns.data.map((returnItem) => (
                                <div
                                    key={returnItem.id}
                                    className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    {/* Left - Return Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-red-500/10 p-2">
                                            <RotateCcw className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-foreground">
                                                    {returnItem.return_no}
                                                </h3>
                                                {returnItem.is_scrap_purchase && (
                                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                        Scrap
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(
                                                    returnItem.return_date,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center - Customer & Sale */}
                                    <div className="flex-1 sm:px-4">
                                        <p className="font-medium text-foreground">
                                            {returnItem.customer.name}
                                        </p>
                                        {returnItem.sale && (
                                            <p className="text-sm text-muted-foreground">
                                                Against:{' '}
                                                {returnItem.sale.bill_no}
                                            </p>
                                        )}
                                    </div>

                                    {/* Right - Amount */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-semibold text-red-600">
                                                -
                                                {formatCurrency(
                                                    returnItem.grand_total,
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {returnItem.total_weight} kg
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/dashboard/sales-returns/${returnItem.id}`}
                                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDelete(returnItem.id)
                                                }
                                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {returns.data.length > 0 && (
                        <div className="mt-6">
                            <Paginator pagination={returns.links} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
