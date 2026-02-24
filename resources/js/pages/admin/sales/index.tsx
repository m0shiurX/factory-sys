import Paginator, { PaginationLink } from '@/components/shared/Paginator';
import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    Edit,
    Eye,
    FileText,
    Plus,
    Receipt,
    Search,
    Trash2,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    total_due: number;
};

type PaymentType = {
    id: number;
    name: string;
};

type Sale = {
    id: number;
    bill_no: string;
    sale_date: string;
    total_pieces: number;
    total_weight_kg: number;
    net_amount: number;
    paid_amount: number;
    due_amount: number;
    customer: Customer;
    payment_type: PaymentType | null;
    created_at: string;
};

type Stats = {
    total_sales: number;
    today_sales: number;
    total_amount: number;
    total_due: number;
};

type Props = {
    sales: {
        data: Sale[];
        links: PaginationLink[];
    };
    stats: Stats;
    filters: {
        search?: string;
        from_date?: string;
        to_date?: string;
    };
};

export default function SalesIndex({ sales, stats, filters }: Props) {
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
                '/dashboard/sales',
                {
                    ...(search && { search }),
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleDelete = (saleId: number) => {
        if (
            confirm(
                'Are you sure you want to delete this sale? This will restore the stock.',
            )
        ) {
            router.delete(`/dashboard/sales/${saleId}`);
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
                                Sales
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage your sales and invoices
                            </p>
                        </div>
                        <Link
                            href="/dashboard/sales/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            New Sale
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Sales
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {stats.total_sales}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <Receipt className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Today's Sales
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-emerald-600">
                                        {stats.today_sales}
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
                                        Total Amount
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-blue-600">
                                        {formatCurrency(stats.total_amount)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Due
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-amber-600">
                                        {formatCurrency(stats.total_due)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-amber-500/10 p-2">
                                    <FileText className="h-5 w-5 text-amber-600" />
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
                                placeholder="Search by bill no or customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-border bg-card py-2.5 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Sales List */}
                    <div className="space-y-3">
                        {sales.data.length === 0 ? (
                            <div className="rounded-xl border border-border bg-card p-12 text-center">
                                <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium text-foreground">
                                    No sales found
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Get started by creating a new sale.
                                </p>
                                <Link
                                    href="/dashboard/sales/create"
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Sale
                                </Link>
                            </div>
                        ) : (
                            sales.data.map((sale) => (
                                <div
                                    key={sale.id}
                                    className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    {/* Left - Bill Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <Receipt className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                {sale.bill_no}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(sale.sale_date)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center - Customer */}
                                    <div className="flex-1 sm:px-4">
                                        <p className="font-medium text-foreground">
                                            {sale.customer.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {sale.customer.address}
                                        </p>
                                    </div>

                                    {/* Right - Amount */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-semibold text-foreground">
                                                {formatCurrency(
                                                    sale.net_amount,
                                                )}
                                            </p>
                                            {sale.due_amount > 0 && (
                                                <p className="text-sm text-red-600">
                                                    Due:{' '}
                                                    {formatCurrency(
                                                        sale.due_amount,
                                                    )}
                                                </p>
                                            )}
                                            {sale.due_amount === 0 && (
                                                <p className="text-sm text-emerald-600">
                                                    Paid
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/dashboard/sales/${sale.id}`}
                                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={`/dashboard/sales/${sale.id}/edit`}
                                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDelete(sale.id)
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
                    {sales.data.length > 0 && (
                        <div className="mt-6">
                            <Paginator pagination={sales.links} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
