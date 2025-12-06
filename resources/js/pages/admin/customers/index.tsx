import Paginator, { PaginationLink } from '@/components/shared/Paginator';
import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    CheckCircle2,
    Edit,
    Eye,
    Plus,
    Search,
    Trash2,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    opening_balance: number;
    total_due: number;
    credit_limit: number;
    is_active: boolean;
    created_at: string;
};

type Stats = {
    total: number;
    active: number;
    with_due: number;
    total_due: number;
};

type Props = {
    customers: {
        data: Customer[];
        links: PaginationLink[];
    };
    stats: Stats;
    filters: {
        search?: string;
        active?: string;
        has_due?: string;
    };
};

export default function CustomersIndex({ customers, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
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
    }, [props.flash?.success, props.flash?.error]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                '/dashboard/customers',
                {
                    ...(search && { search }),
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleDelete = (customerId: number) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            router.delete(`/dashboard/customers/${customerId}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const isOverLimit = (customer: Customer) => {
        return (
            customer.credit_limit > 0 &&
            customer.total_due > customer.credit_limit
        );
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Customers
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage your dealers and customers
                            </p>
                        </div>
                        <Link
                            href="/dashboard/customers/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Add Customer
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Customers
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Active Customers
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-emerald-600">
                                        {stats.active}
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
                                        With Balance Due
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-amber-600">
                                        {stats.with_due}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-amber-500/10 p-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Outstanding
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {formatCurrency(stats.total_due)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <Banknote className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name, phone, or address..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Phone
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Balance Due
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Credit Limit
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {customers.data.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="transition hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {customer.name}
                                                </p>
                                                {customer.address && (
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {customer.address}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm text-foreground">
                                            {customer.phone || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={`font-mono text-sm font-medium ${isOverLimit(customer)
                                                        ? 'text-red-600'
                                                        : customer.total_due > 0
                                                            ? 'text-amber-600'
                                                            : 'text-foreground'
                                                    }`}
                                            >
                                                {formatCurrency(
                                                    customer.total_due,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">
                                            {customer.credit_limit > 0
                                                ? formatCurrency(
                                                    customer.credit_limit,
                                                )
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${customer.is_active
                                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                                        : 'border-border bg-muted text-muted-foreground'
                                                    }`}
                                            >
                                                {customer.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/dashboard/customers/${customer.id}`}
                                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/dashboard/customers/${customer.id}/edit`}
                                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            customer.id,
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {customers.data.length === 0 && (
                            <div className="py-12 text-center">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    No customers found
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {customers.links.length > 3 && (
                        <div className="mt-6">
                            <Paginator pagination={customers.links} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
