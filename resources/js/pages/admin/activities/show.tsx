import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Calendar,
    FileText,
    User,
} from 'lucide-react';

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
    updated_at: string;
    causer: Causer | null;
    subject: Subject | null;
};

type Props = {
    activity: ActivityLog;
};

export default function ActivityShow({ activity }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getSubjectName = () => {
        if (!activity.subject_type) return null;
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

    const renderPropertyValue = (value: unknown): string => {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return String(value);
    };

    const hasProperties =
        activity.properties &&
        (activity.properties.attributes || activity.properties.old);

    return (
        <AppLayout>
            <Head title={`Activity Log #${activity.id}`} />
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Link
                            href="/activities"
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-muted-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Activity Details
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                View detailed information about this activity
                            </p>
                        </div>
                    </div>

                    {/* Activity Card */}
                    <div className="space-y-6">
                        {/* Overview */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="mb-6 flex items-start gap-4 border-b border-border pb-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <Activity className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        {activity.description}
                                    </h2>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        {activity.event && (
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getEventBadgeColor(activity.event)}`}
                                            >
                                                {activity.event}
                                            </span>
                                        )}
                                        {activity.log_name && (
                                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                {activity.log_name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Causer */}
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-muted p-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Performed By
                                        </p>
                                        <p className="mt-0.5 text-sm text-foreground">
                                            {activity.causer?.name || 'System'}
                                        </p>
                                        {activity.causer?.email && (
                                            <p className="text-xs text-muted-foreground">
                                                {activity.causer.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-muted p-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Subject
                                        </p>
                                        <p className="mt-0.5 text-sm text-foreground">
                                            {getSubjectName() || 'N/A'}
                                            {activity.subject_id && (
                                                <span className="ml-1 text-muted-foreground">
                                                    #{activity.subject_id}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-muted p-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Date & Time
                                        </p>
                                        <p className="mt-0.5 text-sm text-foreground">
                                            {formatDate(activity.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Log ID */}
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-muted p-2">
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Activity ID
                                        </p>
                                        <p className="mt-0.5 text-sm text-foreground">
                                            #{activity.id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Properties */}
                        {hasProperties && (
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h3 className="mb-4 text-sm font-medium text-foreground">
                                    Changed Properties
                                </h3>

                                <div className="space-y-4">
                                    {/* New/Updated Values */}
                                    {activity.properties.attributes && (
                                        <div>
                                            <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                                                {activity.event === 'created'
                                                    ? 'Created With'
                                                    : 'New Values'}
                                            </h4>
                                            <div className="rounded-lg border border-border bg-background p-4">
                                                <div className="space-y-2">
                                                    {Object.entries(
                                                        activity.properties
                                                            .attributes,
                                                    ).map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="flex items-start gap-2"
                                                        >
                                                            <span className="font-mono text-xs text-primary">
                                                                {key}:
                                                            </span>
                                                            <span className="font-mono text-xs text-foreground break-all">
                                                                {renderPropertyValue(
                                                                    value,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Old Values */}
                                    {activity.properties.old && (
                                        <div>
                                            <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                                                Old Values
                                            </h4>
                                            <div className="rounded-lg border border-border bg-background p-4">
                                                <div className="space-y-2">
                                                    {Object.entries(
                                                        activity.properties.old,
                                                    ).map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="flex items-start gap-2"
                                                        >
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                {key}:
                                                            </span>
                                                            <span className="font-mono text-xs text-muted-foreground line-through break-all">
                                                                {renderPropertyValue(
                                                                    value,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Raw Properties (for debugging) */}
                        {activity.properties &&
                            Object.keys(activity.properties).length > 0 && (
                                <details className="rounded-xl border border-border bg-card p-6">
                                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                                        View Raw Properties
                                    </summary>
                                    <pre className="mt-4 overflow-auto rounded-lg border border-border bg-background p-4 text-xs">
                                        {JSON.stringify(
                                            activity.properties,
                                            null,
                                            2,
                                        )}
                                    </pre>
                                </details>
                            )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
