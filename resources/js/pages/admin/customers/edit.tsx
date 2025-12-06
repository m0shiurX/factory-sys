import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';
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
};

type Props = {
    customer: Customer;
};

export default function CustomerEdit({ customer }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name,
        phone: customer.phone || '',
        address: customer.address || '',
        opening_balance: customer.opening_balance,
        opening_date: customer.opening_date || '',
        credit_limit: customer.credit_limit,
        is_active: customer.is_active,
    });

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
    }, [props.flash?.success]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/dashboard/customers/${customer.id}`);
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Link
                            href={`/dashboard/customers/${customer.id}`}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Edit Customer
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Update customer information
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
                            {/* Customer Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="Enter customer name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="01XXXXXXXXX"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            {/* Address */}
                            <div>
                                <label
                                    htmlFor="address"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Address
                                </label>
                                <textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    rows={2}
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="Customer address"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Opening Balance */}
                                <div>
                                    <label
                                        htmlFor="opening_balance"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Opening Balance (৳)
                                    </label>
                                    <input
                                        type="number"
                                        id="opening_balance"
                                        value={data.opening_balance}
                                        onChange={(e) =>
                                            setData(
                                                'opening_balance',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <InputError
                                        message={errors.opening_balance}
                                    />
                                </div>

                                {/* Opening Date */}
                                <div>
                                    <label
                                        htmlFor="opening_date"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Opening Date
                                    </label>
                                    <input
                                        type="date"
                                        id="opening_date"
                                        value={data.opening_date}
                                        onChange={(e) =>
                                            setData(
                                                'opening_date',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <InputError message={errors.opening_date} />
                                </div>
                            </div>

                            {/* Current Due (readonly) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Current Balance Due
                                </label>
                                <div className="rounded-lg border border-border bg-muted px-4 py-2.5">
                                    <span className="font-mono text-lg font-semibold text-foreground">
                                        ৳{' '}
                                        {customer.total_due.toLocaleString(
                                            'en-BD',
                                        )}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Updated automatically based on sales and
                                    payments
                                </p>
                            </div>

                            {/* Credit Limit */}
                            <div>
                                <label
                                    htmlFor="credit_limit"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Credit Limit (৳)
                                </label>
                                <input
                                    type="number"
                                    id="credit_limit"
                                    value={data.credit_limit}
                                    onChange={(e) =>
                                        setData(
                                            'credit_limit',
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                    min="0"
                                    step="0.01"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <InputError message={errors.credit_limit} />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Maximum allowed credit (0 = no limit)
                                </p>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <label
                                    htmlFor="is_active"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Active customer
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Link
                                href={`/dashboard/customers/${customer.id}`}
                                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
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
