import Paginator, { PaginationLink } from '@/components/shared/Paginator';
import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Banknote,
    Calendar,
    Eye,
    Plus,
    Search,
    Trash2,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
};

type PaymentType = {
    id: number;
    name: string;
};

type Sale = {
    id: number;
    bill_no: string;
};

type Payment = {
    id: number;
    customer_id: number;
    sale_id: number | null;
    amount: number;
    payment_ref: string | null;
    payment_date: string;
    note: string | null;
    customer: Customer;
    payment_type: PaymentType | null;
    sale: Sale | null;
    created_at: string;
};

type Stats = {
    total_payments: number;
    today_payments: number;
    total_amount: number;
    today_amount: number;
};

type Props = {
    payments: {
        data: Payment[];
        links: PaginationLink[];
    };
    stats: Stats;
    filters: {
        search?: string;
        from_date?: string;
        to_date?: string;
        customer_id?: number;
    };
};

export default function PaymentsIndex({ payments, stats, filters }: Props) {
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
                '/dashboard/payments',
                {
                    ...(search && { search }),
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleDelete = (paymentId: number) => {
        if (
            confirm(
                'Are you sure you want to delete this payment? This will restore the customer due.',
            )
        ) {
            router.delete(`/dashboard/payments/${paymentId}`);
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
                                Payments
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Track customer payments and collections
                            </p>
                        </div>
                        <Link
                            href="/dashboard/payments/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Record Payment
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Payments
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {stats.total_payments}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <Wallet className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Today's Payments
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-emerald-600">
                                        {stats.today_payments}
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
                                        Total Collected
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
                                        Today's Amount
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-amber-600">
                                        {formatCurrency(stats.today_amount)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-amber-500/10 p-2">
                                    <Banknote className="h-5 w-5 text-amber-600" />
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
                                placeholder="Search by customer name, reference, or bill no..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-border bg-card py-2.5 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Payments List */}
                    <div className="space-y-3">
                        {payments.data.length === 0 ? (
                            <div className="rounded-xl border border-border bg-card p-12 text-center">
                                <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium text-foreground">
                                    No payments found
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Get started by recording a new payment.
                                </p>
                                <Link
                                    href="/dashboard/payments/create"
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                >
                                    <Plus className="h-4 w-4" />
                                    Record Payment
                                </Link>
                            </div>
                        ) : (
                            payments.data.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    {/* Left - Payment Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-emerald-500/10 p-2">
                                            <Banknote className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                {formatCurrency(payment.amount)}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(
                                                    payment.payment_date,
                                                )}
                                                {payment.payment_ref && (
                                                    <span className="ml-2">
                                                        • Ref:{' '}
                                                        {payment.payment_ref}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center - Customer */}
                                    <div className="flex-1 sm:px-4">
                                        <p className="font-medium text-foreground">
                                            {payment.customer.name}
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                            {payment.payment_type && (
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                                    {payment.payment_type.name}
                                                </span>
                                            )}
                                            {payment.sale && (
                                                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600">
                                                    {payment.sale.bill_no}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/dashboard/payments/${payment.id}`}
                                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(payment.id)
                                            }
                                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {payments.data.length > 0 && (
                        <div className="mt-6">
                            <Paginator pagination={payments.links} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
