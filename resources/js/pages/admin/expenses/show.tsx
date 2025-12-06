import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Receipt, Trash2, User } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Category = {
    id: number;
    name: string;
};

type CreatedByUser = {
    id: number;
    name: string;
};

type Expense = {
    id: number;
    expense_category_id: number;
    amount: number;
    expense_date: string;
    description: string | null;
    category: Category;
    created_by: CreatedByUser | null;
    created_at: string;
    updated_at: string;
};

type Props = {
    expense: Expense;
};

export default function ExpenseShow({ expense }: Props) {
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

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this expense?')) {
            router.delete(`/dashboard/expenses/${expense.id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/expenses"
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    Expense Details
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    #{expense.id}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/dashboard/expenses/${expense.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/20"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Expense Info Card */}
                    <div className="rounded-xl border border-border bg-card">
                        {/* Header Section */}
                        <div className="border-b border-border p-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-red-500/10 p-4">
                                    <Receipt className="h-8 w-8 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        {expense.category.name}
                                    </p>
                                    <p className="text-3xl font-bold text-red-600">
                                        {formatCurrency(expense.amount)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">
                                            {formatDate(expense.expense_date)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        {expense.description && (
                            <div className="border-b border-border p-6">
                                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                                    Description
                                </h3>
                                <p className="text-sm text-foreground">
                                    {expense.description}
                                </p>
                            </div>
                        )}

                        {/* Meta Section */}
                        <div className="p-6">
                            <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                                Record Information
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-muted p-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Created By
                                        </p>
                                        <p className="text-sm font-medium text-foreground">
                                            {expense.created_by?.name ||
                                                'System'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-muted p-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Created At
                                        </p>
                                        <p className="text-sm font-medium text-foreground">
                                            {formatDateTime(expense.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
