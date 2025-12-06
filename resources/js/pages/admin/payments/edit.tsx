import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';
import { toast } from 'sonner';

type Order = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
};

type Verifier = {
    id: number;
    name: string;
};

type Payment = {
    id: number;
    method: string;
    gateway_number: string | null;
    transaction_id: string | null;
    amount: number;
    status: string;
    admin_notes: string | null;
    verified_at: string | null;
    verifier: Verifier | null;
    order: Order;
};

type Props = {
    payment: Payment;
    statuses: Record<string, string>;
    methods: Record<string, string>;
};

export default function PaymentEdit({ payment, statuses, methods }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();

    const { data, setData, put, processing, errors } = useForm({
        method: payment.method,
        gateway_number: payment.gateway_number || '',
        transaction_id: payment.transaction_id || '',
        status: payment.status,
        admin_notes: payment.admin_notes || '',
    });

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
    }, [props.flash?.success]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/dashboard/payments/${payment.id}`);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
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
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={`/dashboard/orders/${payment.order.order_number}`}
                            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Order
                        </Link>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Edit Payment
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Order: {payment.order.order_number}
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
                                        {payment.order.customer_name}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {payment.order.customer_phone}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Amount
                                    </span>
                                    <p className="text-lg font-semibold text-foreground">
                                        {formatCurrency(payment.amount)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Payment Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="method"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Payment Method
                                    </label>
                                    <select
                                        id="method"
                                        value={data.method}
                                        onChange={(e) =>
                                            setData('method', e.target.value)
                                        }
                                        className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    >
                                        {Object.entries(methods).map(
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
                                    <InputError message={errors.method} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="gateway_number"
                                            className="mb-2 block text-sm font-medium text-foreground"
                                        >
                                            {data.method === 'bank'
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
                                                data.method === 'bank'
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
                                    Payment Status
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
                                {payment.verified_at && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Verified on{' '}
                                        {formatDateTime(payment.verified_at)}
                                        {payment.verifier &&
                                            ` by ${payment.verifier.name}`}
                                    </p>
                                )}
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
                                placeholder="Add internal notes about this payment..."
                                className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                            />
                            <InputError message={errors.admin_notes} />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href={`/dashboard/orders/${payment.order.order_number}`}
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
