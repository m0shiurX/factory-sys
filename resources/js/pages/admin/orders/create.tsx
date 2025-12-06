import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

type Props = {
    plans: Record<
        string,
        {
            name: string;
            duration: string;
            amount: number;
            duration_days: number;
        }
    >;
    paymentMethods: Record<string, string>;
    statuses: Record<string, string>;
};

export default function OrderCreate({ plans, paymentMethods }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        plan_slug: 'yearly',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_address: '',
        payment_method: 'cash',
        gateway_number: '',
        transaction_id: '',
        mark_verified: true,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/dashboard/orders');
    };

    const selectedPlan = plans[data.plan_slug];

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
                            href="/dashboard/orders"
                            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Orders
                        </Link>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Create Manual Order
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add a new order manually for walk-in or phone
                            customers
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Plan Selection */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Select Plan
                            </h2>
                            <div className="grid gap-3">
                                {Object.entries(plans).map(([slug, plan]) => (
                                    <label
                                        key={slug}
                                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
                                            data.plan_slug === slug
                                                ? 'border-slate-900 bg-background ring-1 ring-slate-900'
                                                : 'border-border hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="plan_slug"
                                                value={slug}
                                                checked={
                                                    data.plan_slug === slug
                                                }
                                                onChange={() =>
                                                    setData('plan_slug', slug)
                                                }
                                                className="h-4 w-4 text-foreground focus:ring-slate-500"
                                            />
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {plan.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {plan.duration}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-semibold text-foreground">
                                            {formatCurrency(plan.amount)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.plan_slug} />
                        </div>

                        {/* Customer Information */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Customer Information
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="customer_name"
                                            className="mb-2 block text-sm font-medium text-foreground"
                                        >
                                            Customer Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="customer_name"
                                            value={data.customer_name}
                                            onChange={(e) =>
                                                setData(
                                                    'customer_name',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                            placeholder="Full name"
                                        />
                                        <InputError
                                            message={errors.customer_name}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="customer_phone"
                                            className="mb-2 block text-sm font-medium text-foreground"
                                        >
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="customer_phone"
                                            value={data.customer_phone}
                                            onChange={(e) =>
                                                setData(
                                                    'customer_phone',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                            placeholder="01XXXXXXXXX"
                                        />
                                        <InputError
                                            message={errors.customer_phone}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="customer_email"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        id="customer_email"
                                        value={data.customer_email}
                                        onChange={(e) =>
                                            setData(
                                                'customer_email',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        placeholder="customer@email.com"
                                    />
                                    <InputError
                                        message={errors.customer_email}
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="customer_address"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Address (Optional)
                                    </label>
                                    <textarea
                                        id="customer_address"
                                        value={data.customer_address}
                                        onChange={(e) =>
                                            setData(
                                                'customer_address',
                                                e.target.value,
                                            )
                                        }
                                        rows={2}
                                        className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        placeholder="Shop/home address"
                                    />
                                    <InputError
                                        message={errors.customer_address}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Payment Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="payment_method"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Payment Method *
                                    </label>
                                    <select
                                        id="payment_method"
                                        value={data.payment_method}
                                        onChange={(e) =>
                                            setData(
                                                'payment_method',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    >
                                        {Object.entries(paymentMethods).map(
                                            ([value, label]) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <InputError
                                        message={errors.payment_method}
                                    />
                                </div>

                                {data.payment_method !== 'cash' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="gateway_number"
                                                className="mb-2 block text-sm font-medium text-foreground"
                                            >
                                                {data.payment_method === 'bank'
                                                    ? 'Account Number'
                                                    : 'Sender Number'}
                                            </label>
                                            <input
                                                type="text"
                                                id="gateway_number"
                                                value={data.gateway_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'gateway_number',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                                placeholder={
                                                    data.payment_method ===
                                                    'bank'
                                                        ? 'Account number'
                                                        : '01XXXXXXXXX'
                                                }
                                            />
                                            <InputError
                                                message={errors.gateway_number}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="transaction_id"
                                                className="mb-2 block text-sm font-medium text-foreground"
                                            >
                                                Transaction ID
                                            </label>
                                            <input
                                                type="text"
                                                id="transaction_id"
                                                value={data.transaction_id}
                                                onChange={(e) =>
                                                    setData(
                                                        'transaction_id',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                                placeholder="TXN123ABC"
                                            />
                                            <InputError
                                                message={errors.transaction_id}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="mark_verified"
                                        checked={data.mark_verified}
                                        onChange={(e) =>
                                            setData(
                                                'mark_verified',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-foreground focus:ring-slate-500"
                                    />
                                    <label
                                        htmlFor="mark_verified"
                                        className="text-sm text-foreground"
                                    >
                                        Mark payment as verified immediately
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        {selectedPlan && (
                            <div className="rounded-xl border border-border bg-background p-6">
                                <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                    Order Summary
                                </h2>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Plan
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {selectedPlan.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Duration
                                        </span>
                                        <span className="text-foreground">
                                            {selectedPlan.duration}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-border pt-2">
                                        <span className="font-medium text-foreground">
                                            Total
                                        </span>
                                        <span className="text-lg font-semibold text-foreground">
                                            {formatCurrency(
                                                selectedPlan.amount,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href="/dashboard/orders"
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
                                {processing ? 'Creating...' : 'Create Order'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
