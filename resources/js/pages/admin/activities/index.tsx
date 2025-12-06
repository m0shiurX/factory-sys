import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    ChevronDown,
    Eye,
    FileText,
    Search,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';

type Causer = {
    id: number;
    name: string;
    email: string;
};

type Subject = {
    id: number;
    [key: string]: unknown;
};

type ActivityLog = {
    id: number;
    log_name: string | null;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    causer_type: string | null;
    causer_id: number | null;
    event: string | null;
    properties: {
        attributes?: Record<string, unknown>;
        old?: Record<string, unknown>;
    };
    created_at: string;
    causer: Causer | null;
    subject: Subject | null;
};

type PaginatedActivities = {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

type Filters = {
    log_name?: string;
    event?: string;
    causer_id?: string;
    subject_type?: string;
    search?: string;
};

type Props = {
    activities: PaginatedActivities;
    logNames: string[];
    eventTypes: string[];
    filters: Filters;
};

export default function ActivitiesIndex({
    activities,
    logNames,
    eventTypes,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedLogName, setSelectedLogName] = useState(
        filters.log_name || '',
    );
    const [selectedEvent, setSelectedEvent] = useState(filters.event || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const applyFilters = (newFilters: Partial<Filters>) => {
        router.get(
            '/activities',
            {
                ...filters,
                ...newFilters,
            },
            { preserveState: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedLogName('');
        setSelectedEvent('');
        router.get('/activities');
    };

    const hasActiveFilters =
        filters.log_name ||
        filters.event ||
        filters.causer_id ||
        filters.subject_type ||
        filters.search;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getSubjectName = (activity: ActivityLog) => {
        if (!activity.subject_type) return '—';
        const parts = activity.subject_type.split('\\');
        return parts[parts.length - 1];
    };

    const getEventBadgeColor = (event: string | null) => {
        switch (event) {
            case 'created':
                return 'bg-green-500/10 text-green-600 dark:text-green-400';
            case 'updated':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
            case 'deleted':
                return 'bg-red-500/10 text-red-600 dark:text-red-400';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <AppLayout>
            <Head title="Activity Logs" />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-foreground">
                            Activity Logs
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View all system activity and changes
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Logs
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {activities.total}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Log Types
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {logNames.length}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Event Types
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {eventTypes.length}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        This Page
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {activities.data.length}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-green-500/10 p-2">
                                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-xl border border-border bg-card p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Search */}
                            <form
                                onSubmit={handleSearch}
                                className="flex-1 min-w-[200px]"
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search description..."
                                        className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                </div>
                            </form>

                            {/* Log Name Filter */}
                            <div className="relative">
                                <select
                                    value={selectedLogName}
                                    onChange={(e) => {
                                        setSelectedLogName(e.target.value);
                                        applyFilters({
                                            log_name: e.target.value || undefined,
                                        });
                                    }}
                                    className="appearance-none rounded-lg border border-border bg-background py-2 pl-4 pr-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                >
                                    <option value="">All Log Types</option>
                                    {logNames.map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>

                            {/* Event Filter */}
                            <div className="relative">
                                <select
                                    value={selectedEvent}
                                    onChange={(e) => {
                                        setSelectedEvent(e.target.value);
                                        applyFilters({
                                            event: e.target.value || undefined,
                                        });
                                    }}
                                    className="appearance-none rounded-lg border border-border bg-background py-2 pl-4 pr-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                >
                                    <option value="">All Events</option>
                                    {eventTypes.map((event) => (
                                        <option key={event} value={event}>
                                            {event}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Description
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Event
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Subject
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Causer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {activities.data.map((activity) => (
                                        <tr
                                            key={activity.id}
                                            className="transition hover:bg-muted/50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                                        <Activity className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {activity.description}
                                                        </p>
                                                        {activity.log_name && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {activity.log_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {activity.event ? (
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getEventBadgeColor(activity.event)}`}
                                                    >
                                                        {activity.event}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {getSubjectName(activity)}
                                                {activity.subject_id && (
                                                    <span className="ml-1 text-xs">
                                                        #{activity.subject_id}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {activity.causer?.name || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {formatDate(activity.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/activities/${activity.id}`}
                                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground inline-flex"
                                                    title="View details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {activities.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-border px-6 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing page {activities.current_page} of{' '}
                                    {activities.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {activities.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            preserveScroll
                                            className={`rounded-lg px-3 py-1.5 text-sm transition ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
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
                            </div>
                        )}

                        {/* Empty State */}
                        {activities.data.length === 0 && (
                            <div className="py-12 text-center">
                                <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-sm font-medium text-foreground">
                                    No activity logs found
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Activity will appear here as users interact
                                    with the system.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
