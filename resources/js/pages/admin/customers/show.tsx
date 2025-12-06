import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Banknote,
    Calendar,
    Edit,
    MapPin,
    Phone,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    opening_balance: number;
    opening_date: string | null;
    total_due: number;
    credit_limit: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

type Props = {
    customer: Customer;
};

export default function CustomerShow({ customer }: Props) {
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

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isOverLimit =
        customer.credit_limit > 0 &&
        customer.total_due > customer.credit_limit;

    const availableCredit =
        customer.credit_limit > 0
            ? Math.max(0, customer.credit_limit - customer.total_due)
            : null;

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/customers"
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
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
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
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
                                            <Phone className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Phone
                                            </p>
                                            <p className="font-mono font-medium text-foreground">
                                                {customer.phone || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <MapPin className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Address
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {customer.address || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Info */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">
                                    Financial Information
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div
                                        className={`rounded-lg p-4 ${isOverLimit ? 'bg-red-500/10' : 'bg-muted/50'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isOverLimit && (
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Current Balance Due
                                            </p>
                                        </div>
                                        <p
                                            className={`mt-1 text-2xl font-semibold ${isOverLimit
                                                ? 'text-red-600'
                                                : customer.total_due > 0
                                                    ? 'text-amber-600'
                                                    : 'text-foreground'
                                                }`}
                                        >
                                            {formatCurrency(customer.total_due)}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Credit Limit
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold text-foreground">
                                            {customer.credit_limit > 0
                                                ? formatCurrency(
                                                    customer.credit_limit,
                                                )
                                                : 'No Limit'}
                                        </p>
                                    </div>
                                    {availableCredit !== null && (
                                        <div className="rounded-lg bg-muted/50 p-4">
                                            <p className="text-xs text-muted-foreground">
                                                Available Credit
                                            </p>
                                            <p
                                                className={`mt-1 text-2xl font-semibold ${availableCredit === 0
                                                    ? 'text-red-600'
                                                    : 'text-emerald-600'
                                                    }`}
                                            >
                                                {formatCurrency(availableCredit)}
                                            </p>
                                        </div>
                                    )}
                                    <div className="rounded-lg bg-muted/50 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Opening Balance
                                        </p>
                                        <p className="mt-1 text-xl font-semibold text-foreground">
                                            {formatCurrency(
                                                customer.opening_balance,
                                            )}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            as of {formatDate(customer.opening_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">
                                    Status
                                </h2>
                                <span
                                    className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${customer.is_active
                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                        : 'border-border bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {customer.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Quick Actions */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">
                                    Quick Actions
                                </h2>
                                <div className="space-y-2">
                                    <Link
                                        href={`/dashboard/payments/create?customer_id=${customer.id}`}
                                        className="flex w-full items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                                    >
                                        <Banknote className="h-4 w-4" />
                                        Record Payment
                                    </Link>
                                    <Link
                                        href={`/dashboard/customers/${customer.id}/statement`}
                                        className="flex w-full items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                                    >
                                        <Calendar className="h-4 w-4" />
                                        View Statement
                                    </Link>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">
                                    Timeline
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Created
                                            </p>
                                            <p className="text-sm font-medium text-foreground">
                                                {formatDate(customer.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Last Updated
                                            </p>
                                            <p className="text-sm font-medium text-foreground">
                                                {formatDate(customer.updated_at)}
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
