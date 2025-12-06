import AppLayout from '@/layouts/app-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    HelpCircle,
    Mail,
    MessageCircle,
    MoreHorizontal,
    Package,
    Phone,
    Save,
    ShoppingCart,
    User,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Order = {
    id: number;
    order_number: string;
    plan_name: string;
    amount: number;
    status: string;
    created_at: string;
};

type Customer = {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    status: string;
    orders: Order[];
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
    updated_at: string;
};

type Props = {
    ticket: Ticket;
    statuses: Record<string, string>;
    priorities: Record<string, string>;
    categories: Record<string, string>;
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
    urgent: 'bg-red-500/10 text-destructive border-red-500/20 dark:bg-red-500/20',
};

const categoryIcons: Record<string, typeof MessageCircle> = {
    general: MessageCircle,
    order_issue: Package,
    product_inquiry: HelpCircle,
    complaint: AlertTriangle,
    other: MoreHorizontal,
};

export default function SupportShow({
    ticket,
    statuses,
    priorities,
    categories,
}: Props) {
    const { props } = usePage<{
        flash?: { success?: string; error?: string };
    }>();

    const { data, setData, put, processing } = useForm({
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        admin_notes: ticket.admin_notes || '',
    });

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/dashboard/support/${ticket.id}`);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const CategoryIcon = categoryIcons[ticket.category] || MessageCircle;

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href="/dashboard/support"
                            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Support
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    Support Ticket #{ticket.id}
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Received {formatDateTime(ticket.created_at)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${statusStyles[ticket.status]}`}
                                >
                                    {statuses[ticket.status]}
                                </span>
                                <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${priorityStyles[ticket.priority]}`}
                                >
                                    {priorities[ticket.priority]}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Contact Info */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        Contact Information
                                    </h2>
                                    {ticket.customer && (
                                        <Link
                                            href={`/dashboard/customers/${ticket.customer.id}`}
                                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                        >
                                            View Customer Profile
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Name
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {ticket.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Phone
                                            </p>
                                            <a
                                                href={`tel:${ticket.phone}`}
                                                className="font-medium text-foreground hover:text-blue-600"
                                            >
                                                {ticket.phone}
                                            </a>
                                        </div>
                                    </div>
                                    {ticket.email && (
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-muted p-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Email
                                                </p>
                                                <a
                                                    href={`mailto:${ticket.email}`}
                                                    className="font-medium text-foreground hover:text-blue-600"
                                                >
                                                    {ticket.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {ticket.customer && (
                                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm font-medium text-emerald-700">
                                            This is an existing customer
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Message */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        Message
                                    </h2>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                        {categories[ticket.category]}
                                    </span>
                                </div>
                                <div className="prose prose-slate max-w-none">
                                    <p className="whitespace-pre-wrap text-foreground">
                                        {ticket.message}
                                    </p>
                                </div>
                            </div>

                            {/* Customer Orders (if linked) */}
                            {ticket.customer &&
                                ticket.customer.orders.length > 0 && (
                                    <div className="rounded-xl border border-border bg-card p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                                Recent Orders
                                            </h2>
                                            <Link
                                                href={`/dashboard/customers/${ticket.customer.id}`}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                View All
                                            </Link>
                                        </div>
                                        <div className="space-y-3">
                                            {ticket.customer.orders.map(
                                                (order) => (
                                                    <Link
                                                        key={order.id}
                                                        href={`/dashboard/orders/${order.order_number}`}
                                                        className="flex items-center justify-between rounded-lg border border-border p-3 transition hover:bg-background"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="rounded-lg bg-muted p-2">
                                                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="font-mono text-sm font-medium text-foreground">
                                                                    {
                                                                        order.order_number
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        order.plan_name
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-foreground">
                                                                {formatCurrency(
                                                                    order.amount,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatDate(
                                                                    order.created_at,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Admin Actions Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="rounded-xl border border-border bg-card p-6"
                            >
                                <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                    Manage Ticket
                                </h2>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Status
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={(e) =>
                                                setData(
                                                    'status',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        >
                                            {Object.entries(statuses).map(
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
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Priority
                                        </label>
                                        <select
                                            value={data.priority}
                                            onChange={(e) =>
                                                setData(
                                                    'priority',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        >
                                            {Object.entries(priorities).map(
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
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Category
                                        </label>
                                        <select
                                            value={data.category}
                                            onChange={(e) =>
                                                setData(
                                                    'category',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        >
                                            {Object.entries(categories).map(
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
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                                        Admin Notes
                                    </label>
                                    <textarea
                                        value={data.admin_notes}
                                        onChange={(e) =>
                                            setData(
                                                'admin_notes',
                                                e.target.value,
                                            )
                                        }
                                        rows={4}
                                        placeholder="Add internal notes about this ticket..."
                                        className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Ticket Details */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                    Ticket Details
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Created
                                            </p>
                                            <p className="text-sm font-medium text-foreground">
                                                {formatDateTime(
                                                    ticket.created_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Last Updated
                                            </p>
                                            <p className="text-sm font-medium text-foreground">
                                                {formatDateTime(
                                                    ticket.updated_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                    Quick Actions
                                </h2>
                                <div className="space-y-2">
                                    <a
                                        href={`tel:${ticket.phone}`}
                                        className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-sm font-medium text-foreground transition hover:bg-background"
                                    >
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        Call Customer
                                    </a>
                                    {ticket.email && (
                                        <a
                                            href={`mailto:${ticket.email}`}
                                            className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-sm font-medium text-foreground transition hover:bg-background"
                                        >
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            Send Email
                                        </a>
                                    )}
                                    <a
                                        href={`https://wa.me/${ticket.phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-sm font-medium text-foreground transition hover:bg-background"
                                    >
                                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                        WhatsApp
                                    </a>
                                </div>
                            </div>

                            {/* Customer Summary (if linked) */}
                            {ticket.customer && (
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        Customer Summary
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Status
                                            </span>
                                            <span className="text-sm font-medium text-foreground capitalize">
                                                {ticket.customer.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Total Orders
                                            </span>
                                            <span className="text-sm font-medium text-foreground">
                                                {ticket.customer.orders.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
