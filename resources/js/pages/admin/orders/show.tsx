import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    CreditCard,
    Edit2,
    Mail,
    MapPin,
    Phone,
    User,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Payment = {
    id: number;
    method: string;
    gateway_number: string | null;
    transaction_id: string | null;
    amount: number;
    status: string;
    verified_at: string | null;
    verifier: {
        id: number;
        name: string;
    } | null;
    created_at: string;
};

type Customer = {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
};

type Order = {
    id: number;
    order_number: string;
    plan_slug: string;
    plan_name: string;
    plan_duration: string;
    amount: number;
    customer_id: number;
    customer: Customer | null;
    business_name: string | null;
    status: string;
    admin_notes: string | null;
    subscription_starts_at: string | null;
    subscription_ends_at: string | null;
    created_at: string;
    updated_at: string;
    payments: Payment[];
};

type Props = {
    order: Order;
    statuses: Record<string, string>;
    paymentMethods: Record<string, string>;
};

const statusStyles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
    verified: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400',
    processing: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400',
    completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400',
    failed: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400',
    refunded: 'bg-muted text-muted-foreground border-border',
};

export default function OrderShow({ order, statuses, paymentMethods }: Props) {
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const handleVerifyPayment = (paymentId: number) => {
        if (confirm('Mark this payment as verified?')) {
            router.post(`/dashboard/payments/${paymentId}/verify`);
        }
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href="/dashboard/orders"
                            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Orders
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    {order.order_number}
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Created {formatDateTime(order.created_at)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${statusStyles[order.status] || 'bg-background text-foreground'}`}
                                >
                                    {statuses[order.status]}
                                </span>
                                <Link
                                    href={`/dashboard/orders/${order.order_number}/edit`}
                                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Edit
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Customer Info */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        Customer Information
                                    </h2>
                                    {order.customer && (
                                        <Link
                                            href={`/dashboard/customers/${order.customer.id}`}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            View Profile
                                        </Link>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Name
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {order.customer?.name || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Phone
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {order.customer?.phone || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    {order.customer?.email && (
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-muted p-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Email
                                                </p>
                                                <p className="font-medium text-foreground">
                                                    {order.customer.email}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {order.customer?.address && (
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-muted p-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Address
                                                </p>
                                                <p className="font-medium text-foreground">
                                                    {order.customer.address}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {order.business_name && (
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-muted p-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Business Name
                                                </p>
                                                <p className="font-medium text-foreground">
                                                    {order.business_name}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payments */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                    Payments
                                </h2>
                                {order.payments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No payments recorded
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {order.payments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="rounded-lg border border-border p-4"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-lg bg-muted p-2">
                                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground">
                                                                {
                                                                    paymentMethods[
                                                                    payment
                                                                        .method
                                                                    ]
                                                                }
                                                            </p>
                                                            {payment.gateway_number && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    From:{' '}
                                                                    {
                                                                        payment.gateway_number
                                                                    }
                                                                </p>
                                                            )}
                                                            {payment.transaction_id && (
                                                                <p className="font-mono text-xs text-muted-foreground">
                                                                    TXN:{' '}
                                                                    {
                                                                        payment.transaction_id
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-foreground">
                                                            {formatCurrency(
                                                                payment.amount,
                                                            )}
                                                        </p>
                                                        <span
                                                            className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[payment.status]}`}
                                                        >
                                                            {payment.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                {payment.verified_at && (
                                                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-muted-foreground">
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                        Verified on{' '}
                                                        {formatDateTime(
                                                            payment.verified_at,
                                                        )}
                                                        {payment.verifier &&
                                                            ` by ${payment.verifier.name}`}
                                                    </div>
                                                )}
                                                {payment.status ===
                                                    'pending' && (
                                                        <div className="mt-3 border-t border-slate-100 pt-3">
                                                            <button
                                                                onClick={() =>
                                                                    handleVerifyPayment(
                                                                        payment.id,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                                                            >
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Verify Payment
                                                            </button>
                                                            <Link
                                                                href={`/dashboard/payments/${payment.id}/edit`}
                                                                className="ml-2 inline-flex items-center gap-2 rounded-lg bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                                Edit
                                                            </Link>
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Admin Notes */}
                            {order.admin_notes && (
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        Admin Notes
                                    </h2>
                                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                        {order.admin_notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                    Order Summary
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Plan
                                        </span>
                                        <span className="text-sm font-medium text-foreground">
                                            {order.plan_name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Duration
                                        </span>
                                        <span className="text-sm text-foreground">
                                            {order.plan_duration}
                                        </span>
                                    </div>
                                    <div className="border-t border-border pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-foreground">
                                                Total
                                            </span>
                                            <span className="text-lg font-semibold text-foreground">
                                                {formatCurrency(order.amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subscription */}
                            {(order.subscription_starts_at ||
                                order.subscription_ends_at) && (
                                    <div className="rounded-xl border border-border bg-card p-6">
                                        <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                            Subscription
                                        </h2>
                                        <div className="space-y-3">
                                            {order.subscription_starts_at && (
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Starts
                                                        </p>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {formatDate(
                                                                order.subscription_starts_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {order.subscription_ends_at && (
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Ends
                                                        </p>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {formatDate(
                                                                order.subscription_ends_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
