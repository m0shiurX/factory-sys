import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Banknote,
    Calendar,
    CreditCard,
    Edit,
    FileText,
    MapPin,
    Phone,
    User,
    Wallet,
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
        customer.credit_limit > 0 && customer.total_due > customer.credit_limit;

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
                        <Link
                            href="/dashboard/customers"
                            className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Customers</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/dashboard/customers/${customer.id}/statement`}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                <FileText className="h-4 w-4" />
                                Statement
                            </Link>
                            <Link
                                href={`/dashboard/customers/${customer.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                            <Link
                                href={`/dashboard/payments/create?customer_id=${customer.id}`}
                                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
                            >
                                <Banknote className="h-4 w-4" />
                                Record Payment
                            </Link>
                        </div>
                    </div>

                    {/* Customer Card */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        {/* Card Header */}
                        <div className={`px-6 py-5 ${isOverLimit ? 'bg-linear-to-r from-red-500 to-red-600' : customer.total_due > 0 ? 'bg-linear-to-r from-amber-500 to-amber-600' : 'bg-linear-to-r from-emerald-500 to-emerald-600'}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <User className="h-6 w-6 text-white" />
                                        <h1 className="text-2xl font-bold text-white">
                                            {customer.name}
                                        </h1>
                                    </div>
                                    <p className="mt-1 text-white/80">
                                        Customer since {formatDate(customer.created_at)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-white">
                                        {formatCurrency(customer.total_due)}
                                    </p>
                                    <p className="text-xs tracking-wide text-white/80 uppercase">
                                        {isOverLimit ? 'Over Limit' : 'Balance Due'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="border-b border-border px-6 py-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-6">
                                    {customer.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-mono text-sm font-medium text-foreground">
                                                {customer.phone}
                                            </span>
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-foreground">
                                                {customer.address}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <span
                                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${customer.is_active
                                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                            : 'border-border bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {customer.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        {/* Financial Overview */}
                        <div className="px-6 py-5">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Balance Due */}
                                <div className={`rounded-lg p-4 ${isOverLimit ? 'bg-red-500/10' : 'bg-muted/50'}`}>
                                    <div className="flex items-center gap-2">
                                        {isOverLimit && (
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                        )}
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Balance Due
                                        </p>
                                    </div>
                                    <p
                                        className={`mt-2 text-2xl font-bold ${isOverLimit
                                                ? 'text-red-600'
                                                : customer.total_due > 0
                                                    ? 'text-amber-600'
                                                    : 'text-emerald-600'
                                            }`}
                                    >
                                        {formatCurrency(customer.total_due)}
                                    </p>
                                </div>

                                {/* Credit Limit */}
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Credit Limit
                                        </p>
                                    </div>
                                    <p className="mt-2 text-2xl font-bold text-foreground">
                                        {customer.credit_limit > 0
                                            ? formatCurrency(customer.credit_limit)
                                            : 'No Limit'}
                                    </p>
                                </div>

                                {/* Available Credit */}
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Available Credit
                                        </p>
                                    </div>
                                    <p
                                        className={`mt-2 text-2xl font-bold ${availableCredit === null
                                                ? 'text-foreground'
                                                : availableCredit === 0
                                                    ? 'text-red-600'
                                                    : 'text-emerald-600'
                                            }`}
                                    >
                                        {availableCredit !== null
                                            ? formatCurrency(availableCredit)
                                            : 'Unlimited'}
                                    </p>
                                </div>

                                {/* Opening Balance */}
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Opening Balance
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-foreground">
                                        {formatCurrency(customer.opening_balance)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        as of {formatDate(customer.opening_date)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border bg-muted/30 px-6 py-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Created {formatDate(customer.created_at)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Updated {formatDate(customer.updated_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
