import { PaginationLink } from '@/components/shared/Paginator';
import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Eye,
    Plus,
    Search,
    Trash2,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    status: string;
    source: string;
    orders_count: number;
    created_at: string;
};

type Stats = {
    total: number;
    leads: number;
    active: number;
    pending: number;
};

type Props = {
    customers: {
        data: Customer[];
        links: PaginationLink[];
    };
    stats: Stats;
    statuses: Record<string, string>;
    sources: Record<string, string>;
    filters: {
        status?: string;
        source?: string;
        search?: string;
    };
};

const statusStyles: Record<string, string> = {
    lead: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
    pending: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400',
    active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
    expired: 'bg-muted text-muted-foreground border-border',
};

export default function CustomersIndex({
    customers,
    stats,
    statuses,
    sources,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [source, setSource] = useState(filters.source || '');
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
                    ...(status && { status }),
                    ...(source && { source }),
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, status, source]);

    const handleDelete = (customerId: number) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            router.delete(`/dashboard/customers/${customerId}`);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
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
                                Manage your customers and leads
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
                                        Leads
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">
                                        {stats.leads}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-amber-500/10 p-2">
                                    <UserPlus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Pending
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                        {stats.pending}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Active
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                                        {stats.active}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-emerald-500/10 p-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name, phone, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                        >
                            <option value="">All Status</option>
                            {Object.entries(statuses).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                        >
                            <option value="">All Sources</option>
                            {Object.entries(sources).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        {customers.data.length === 0 ? (
                            <div className="py-16 text-center">
                                <UserCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                <h3 className="text-sm font-medium text-foreground">
                                    No customers found
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {search || status || source
                                        ? 'Try adjusting your filters'
                                        : 'Add your first customer to get started'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Phone
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Source
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Orders
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Added
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {customers.data.map((customer) => (
                                            <tr
                                                key={customer.id}
                                                className="transition hover:bg-muted/50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {customer.name}
                                                        </p>
                                                        {customer.email && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {customer.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-sm text-muted-foreground">
                                                        {customer.phone}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[customer.status] || 'bg-muted text-muted-foreground'}`}
                                                    >
                                                        {
                                                            statuses[
                                                            customer.status
                                                            ]
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">
                                                    {sources[customer.source]}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {customer.orders_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">
                                                    {formatDate(
                                                        customer.created_at,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/dashboard/customers/${customer.id}`}
                                                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    customer.id,
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {customers.links.length > 3 && (
                        <div className="mt-6 flex items-center justify-center gap-1">
                            {customers.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    preserveState
                                    className={`rounded-lg px-3 py-2 text-sm ${link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : link.url
                                            ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            : 'cursor-not-allowed text-muted-foreground/50'
                                        }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
