import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Edit,
    Mail,
    MapPin,
    Phone,
    ShoppingCart,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Payment = {
    id: number;
    method: string;
    status: string;
    amount: number;
};

type Order = {
    id: number;
    order_number: string;
    plan_name: string;
    amount: number;
    status: string;
    created_at: string;
    payments: Payment[];
};

type Customer = {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    status: string;
    source: string;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    orders: Order[];
};

type Props = {
    customer: Customer;
    statuses: Record<string, string>;
    sources: Record<string, string>;
};

const statusStyles: Record<string, string> = {
    lead: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
    pending: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400',
    active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
    expired: 'bg-muted text-muted-foreground border-border',
};

const orderStatusStyles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
    verified: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400',
    processing: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400',
    completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400',
};

export default function CustomerShow({ customer, statuses, sources }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
    }, [props.flash?.success]);

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

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/customers"
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-muted-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    {customer.name}
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Customer since{' '}
                                    {formatDate(customer.created_at)}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/customers/${customer.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Link>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Info */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Contact Info */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">
                                    Contact Information
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Phone
                                            </p>
                                            <p className="font-mono text-sm font-medium text-foreground">
                                                {customer.phone}
                                            </p>
                                        </div>
                                    </div>
                                    {customer.email && (
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-muted p-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Email
                                                </p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {customer.email}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-muted p-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Address
                                                </p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {customer.address}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Orders */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Orders
                                    </h2>
                                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                        {customer.orders.length} total
                                    </span>
                                </div>
                                {customer.orders.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                                        <p className="text-sm text-muted-foreground">
                                            No orders yet
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {customer.orders.map((order) => (
                                            <Link
                                                key={order.id}
                                                href={`/dashboard/orders/${order.order_number}`}
                                                className="block rounded-lg border border-border p-4 transition hover:border-slate-300 hover:bg-background"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-mono text-sm font-medium text-foreground">
                                                            {order.order_number}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {order.plan_name}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {formatCurrency(
                                                                order.amount,
                                                            )}
                                                        </p>
                                                        <span
                                                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${orderStatusStyles[order.status] || 'bg-background text-foreground'}`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    {formatDateTime(
                                                        order.created_at,
                                                    )}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Admin Notes */}
                            {customer.admin_notes && (
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <h2 className="mb-3 text-lg font-semibold text-foreground">
                                        Admin Notes
                                    </h2>
                                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                        {customer.admin_notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-sm font-medium text-muted-foreground">
                                    Status
                                </h2>
                                <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${statusStyles[customer.status] || 'bg-background text-foreground'}`}
                                >
                                    {statuses[customer.status]}
                                </span>
                            </div>

                            {/* Source Card */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-sm font-medium text-muted-foreground">
                                    Source
                                </h2>
                                <p className="text-sm font-medium text-foreground">
                                    {sources[customer.source]}
                                </p>
                            </div>

                            {/* Timestamps */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-sm font-medium text-muted-foreground">
                                    Timeline
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Created
                                            </p>
                                            <p className="text-sm text-foreground">
                                                {formatDateTime(
                                                    customer.created_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Last Updated
                                            </p>
                                            <p className="text-sm text-foreground">
                                                {formatDateTime(
                                                    customer.updated_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
