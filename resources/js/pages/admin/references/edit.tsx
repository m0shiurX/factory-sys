import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    status: string;
    source: string;
    admin_notes: string | null;
};

type Props = {
    customer: Customer;
    statuses: Record<string, string>;
    sources: Record<string, string>;
};

export default function CustomerEdit({ customer, statuses, sources }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        status: customer.status,
        admin_notes: customer.admin_notes || '',
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
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-muted-foreground"
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
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
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
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border px-4 py-2.5 font-mono text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="01XXXXXXXXX"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
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
                                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="Customer address"
                                />
                                <InputError message={errors.address} />
                            </div>

                            {/* Status */}
                            <div>
                                <label
                                    htmlFor="status"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Status *
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

                            {/* Source (Read-only) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Source
                                </label>
                                <p className="rounded-lg border border-slate-100 bg-background px-4 py-2.5 text-sm text-muted-foreground">
                                    {sources[customer.source]}
                                </p>
                            </div>

                            {/* Admin Notes */}
                            <div>
                                <label
                                    htmlFor="admin_notes"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Admin Notes
                                </label>
                                <textarea
                                    id="admin_notes"
                                    value={data.admin_notes}
                                    onChange={(e) =>
                                        setData('admin_notes', e.target.value)
                                    }
                                    rows={4}
                                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="Internal notes about this customer..."
                                />
                                <InputError message={errors.admin_notes} />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
                                <Link
                                    href={`/dashboard/customers/${customer.id}`}
                                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
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
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
