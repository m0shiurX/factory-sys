import { PaginationLink } from '@/components/shared/Paginator';
import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    Inbox,
    Loader2,
    MessageSquare,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: number;
    name: string;
    phone: string;
    email: string | null;
};

type Ticket = {
    id: number;
    customer_id: number | null;
    customer: Customer | null;
    name: string;
    email: string | null;
    phone: string;
    message: string;
    status: string;
    priority: string;
    category: string;
    admin_notes: string | null;
    created_at: string;
};

type Stats = {
    total: number;
    new: number;
    in_progress: number;
    resolved: number;
    this_month: number;
};

type Props = {
    tickets: {
        data: Ticket[];
        links: PaginationLink[];
    };
    stats: Stats;
    statuses: Record<string, string>;
    priorities: Record<string, string>;
    categories: Record<string, string>;
    filters: {
        status?: string;
        priority?: string;
        category?: string;
        search?: string;
    };
};

const statusStyles: Record<string, string> = {
    new: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400',
    in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400',
    resolved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
    closed: 'bg-muted text-muted-foreground border-border',
};

const priorityStyles: Record<string, string> = {
    low: 'bg-muted text-muted-foreground border-border',
    normal: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400',
    high: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
    urgent: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400',
};

export default function SupportIndex({
    tickets,
    stats,
    statuses,
    priorities,
    categories,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [category, setCategory] = useState(filters.category || '');
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
                '/dashboard/support',
                {
                    ...(search && { search }),
                    ...(status && { status }),
                    ...(priority && { priority }),
                    ...(category && { category }),
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, status, priority, category]);

    const handleDelete = (ticketId: number) => {
        if (confirm('Are you sure you want to delete this ticket?')) {
            router.delete(`/dashboard/support/${ticketId}`);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const truncateMessage = (message: string, maxLength: number = 80) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-foreground">
                            Support
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage customer inquiries and support tickets
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Tickets
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-foreground">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        New
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-destructive">
                                        {stats.new}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-red-500/10 p-2">
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        In Progress
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-blue-600">
                                        {stats.in_progress}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <Loader2 className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Resolved
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-emerald-600">
                                        {stats.resolved}
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
                                        This Month
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-foreground">
                                        {stats.this_month}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 lg:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name, phone, email, message..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-border py-2.5 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                        >
                            <option value="">All Status</option>
                            {Object.entries(statuses).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                        >
                            <option value="">All Priority</option>
                            {Object.entries(priorities).map(
                                ([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ),
                            )}
                        </select>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="rounded-lg border border-border px-4 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                        >
                            <option value="">All Categories</option>
                            {Object.entries(categories).map(
                                ([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    {/* Tickets List */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        {tickets.data.length === 0 ? (
                            <div className="py-16 text-center">
                                <Inbox className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                <h3 className="text-sm font-medium text-foreground">
                                    No tickets found
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {search || status || priority || category
                                        ? 'Try adjusting your filters'
                                        : 'No support tickets yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {tickets.data.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className={`p-5 transition hover:bg-background ${ticket.status === 'new'
                                            ? 'border-l-4 border-l-red-500 bg-red-50/30'
                                            : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[ticket.status]}`}
                                                    >
                                                        {
                                                            statuses[
                                                            ticket.status
                                                            ]
                                                        }
                                                    </span>
                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${priorityStyles[ticket.priority]}`}
                                                    >
                                                        {
                                                            priorities[
                                                            ticket.priority
                                                            ]
                                                        }
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {
                                                            categories[
                                                            ticket.category
                                                            ]
                                                        }
                                                    </span>
                                                    {ticket.customer && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Existing Customer
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mb-2 flex items-center gap-4">
                                                    <h3 className="font-medium text-foreground">
                                                        {ticket.name}
                                                    </h3>
                                                    <span className="font-mono text-sm text-muted-foreground">
                                                        {ticket.phone}
                                                    </span>
                                                    {ticket.email && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {ticket.email}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {truncateMessage(
                                                        ticket.message,
                                                    )}
                                                </p>
                                                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(
                                                        ticket.created_at,
                                                    )}{' '}
                                                    at{' '}
                                                    {formatTime(
                                                        ticket.created_at,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/dashboard/support/${ticket.id}`}
                                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-muted-foreground"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(ticket.id)
                                                    }
                                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {tickets.links.length > 3 && (
                        <div className="mt-6 flex items-center justify-center gap-1">
                            {tickets.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    preserveState
                                    className={`rounded-lg px-3 py-2 text-sm ${link.active
                                        ? 'bg-primary text-white'
                                        : link.url
                                            ? 'text-muted-foreground hover:bg-muted'
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
