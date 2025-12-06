import { PaginationLink } from '@/components/shared/Paginator';
import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Edit2,
    Eye,
    Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Order = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
};

type Payment = {
    id: number;
    method: string;
    gateway_number: string | null;
    transaction_id: string | null;
    amount: number;
    status: string;
    verified_at: string | null;
    created_at: string;
    order: Order;
};

type Stats = {
    total: number;
    pending: number;
    verified: number;
    totalAmount: number;
    thisMonth: number;
};

type Props = {
    payments: {
        data: Payment[];
        links: PaginationLink[];
    };
    stats: Stats;
    statuses: Record<string, string>;
    methods: Record<string, string>;
    filters: {
        status?: string;
        method?: string;
        search?: string;
    };
};

const statusStyles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
    verified: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
    failed: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400',
    refunded: 'bg-muted text-muted-foreground border-border',
};

const methodColors: Record<string, string> = {
    bkash: 'text-pink-600 bg-pink-500/10 dark:text-pink-400 dark:bg-pink-500/20',
    nagad: 'text-orange-600 bg-orange-500/10 dark:text-orange-400 dark:bg-orange-500/20',
    upay: 'text-green-600 bg-green-500/10 dark:text-green-400 dark:bg-green-500/20',
    bank: 'text-blue-600 bg-blue-500/10 dark:text-blue-400 dark:bg-blue-500/20',
    cash: 'text-muted-foreground bg-muted',
};

export default function PaymentsIndex({
    payments,
    stats,
    statuses,
    methods,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [method, setMethod] = useState(filters.method || '');
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
    }, [props.flash]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                '/dashboard/payments',
                {
                    ...(search && { search }),
                    ...(status && { status }),
                    ...(method && { method }),
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, status, method]);

    const handleVerify = (paymentId: number) => {
        if (confirm('Mark this payment as verified?')) {
            router.post(`/dashboard/payments/${paymentId}/verify`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-foreground">
                            Payments
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View and verify customer payments
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Payments
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-foreground">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Pending
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-amber-600">
                                        {stats.pending}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-amber-500/10 p-2">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Verified
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-emerald-600">
                                        {stats.verified}
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
                                        Verified Amount
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-foreground">
                                        {formatCurrency(stats.totalAmount)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        This Month
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-foreground">
                                        {stats.thisMonth}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by TXN ID, order #, customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-border py-2.5 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                        >
                            <option value="">All Status</option>
                            {Object.entries(statuses).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                        >
                            <option value="">All Methods</option>
                            {Object.entries(methods).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        {payments.data.length === 0 ? (
                            <div className="py-16 text-center">
                                <CreditCard className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                <h3 className="text-sm font-medium text-foreground">
                                    No payments found
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {search || status || method
                                        ? 'Try adjusting your filters'
                                        : 'No payments have been made yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-background">
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Order
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Method
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Transaction
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {payments.data.map((payment) => (
                                            <tr
                                                key={payment.id}
                                                className="transition hover:bg-background"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <Link
                                                            href={`/dashboard/orders/${payment.order.order_number}`}
                                                            className="font-mono text-sm font-medium text-foreground hover:text-blue-600"
                                                        >
                                                            {
                                                                payment.order
                                                                    .order_number
                                                            }
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                payment.order
                                                                    .customer_name
                                                            }
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${methodColors[payment.method] || 'bg-muted text-muted-foreground'}`}
                                                    >
                                                        {
                                                            methods[
                                                            payment.method
                                                            ]
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {payment.transaction_id ? (
                                                        <div>
                                                            <p className="font-mono text-sm text-foreground">
                                                                {
                                                                    payment.transaction_id
                                                                }
                                                            </p>
                                                            {payment.gateway_number && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    From:{' '}
                                                                    {
                                                                        payment.gateway_number
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {formatCurrency(
                                                            payment.amount,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[payment.status] || 'bg-background text-foreground'}`}
                                                    >
                                                        {
                                                            statuses[
                                                            payment.status
                                                            ]
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">
                                                    {formatDate(
                                                        payment.created_at,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {payment.status ===
                                                            'pending' && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleVerify(
                                                                            payment.id,
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                                                                >
                                                                    Verify
                                                                </button>
                                                            )}
                                                        <Link
                                                            href={`/dashboard/orders/${payment.order.order_number}`}
                                                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-muted-foreground"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/dashboard/payments/${payment.id}/edit`}
                                                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-muted-foreground"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {payments.links.length > 3 && (
                        <div className="mt-6 flex items-center justify-center gap-1">
                            {payments.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    preserveState
                                    className={`rounded-lg px-3 py-2 text-sm ${link.active
                                        ? 'bg-primary text-white'
                                        : link.url
                                            ? 'text-muted-foreground hover:bg-muted'
                                            : 'cursor-not-allowed text-muted-foreground/50'
                                        }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
