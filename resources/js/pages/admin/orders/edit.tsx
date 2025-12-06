import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

type Payment = {
    id: number;
    method: string;
    status: string;
    amount: number;
};

type Order = {
    id: number;
    order_number: string;
    plan_slug: string;
    plan_name: string;
    plan_duration: string;
    amount: number;
    customer_name: string;
    customer_phone: string;
    status: string;
    admin_notes: string | null;
    subscription_starts_at: string | null;
    subscription_ends_at: string | null;
    payments: Payment[];
};

type Props = {
    order: Order;
    statuses: Record<string, string>;
    plans: Record<
        string,
        {
            name: string;
            duration: string;
            amount: number;
            duration_days: number;
        }
    >;
};

export default function OrderEdit({ order, statuses }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        status: order.status,
        admin_notes: order.admin_notes || '',
        subscription_starts_at: order.subscription_starts_at || '',
        subscription_ends_at: order.subscription_ends_at || '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/dashboard/orders/${order.order_number}`);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={`/dashboard/orders/${order.order_number}`}
                            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Order
                        </Link>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Edit Order
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {order.order_number}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Order Info (Read-only) */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Order Details
                            </h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">
                                        Customer
                                    </span>
                                    <p className="font-medium text-foreground">
                                        {order.customer_name}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {order.customer_phone}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Plan</span>
                                    <p className="font-medium text-foreground">
                                        {order.plan_name}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {formatCurrency(order.amount)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Status
                            </h2>
                            <div>
                                <label
                                    htmlFor="status"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Order Status
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) =>
                                        setData('status', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                >
                                    {Object.entries(statuses).map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ),
                                    )}
                                </select>
                                <InputError message={errors.status} />
                            </div>
                        </div>

                        {/* Subscription Dates */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Subscription Period
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="subscription_starts_at"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        id="subscription_starts_at"
                                        value={data.subscription_starts_at}
                                        onChange={(e) =>
                                            setData(
                                                'subscription_starts_at',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    <InputError
                                        message={errors.subscription_starts_at}
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="subscription_ends_at"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        id="subscription_ends_at"
                                        value={data.subscription_ends_at}
                                        onChange={(e) =>
                                            setData(
                                                'subscription_ends_at',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    <InputError
                                        message={errors.subscription_ends_at}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Admin Notes */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Admin Notes
                            </h2>
                            <textarea
                                id="admin_notes"
                                value={data.admin_notes}
                                onChange={(e) =>
                                    setData('admin_notes', e.target.value)
                                }
                                rows={4}
                                placeholder="Add internal notes about this order..."
                                className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                            />
                            <InputError message={errors.admin_notes} />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href={`/dashboard/orders/${order.order_number}`}
                                className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
