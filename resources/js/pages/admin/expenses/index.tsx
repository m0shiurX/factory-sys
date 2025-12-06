import Paginator, { PaginationLink } from '@/components/shared/Paginator';
import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    Edit,
    Eye,
    Filter,
    Plus,
    Receipt,
    Search,
    Trash2,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Category = {
    id: number;
    name: string;
};

type User = {
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
    created_by: User | null;
    created_at: string;
};

type Stats = {
    total_expenses: number;
    today_expenses: number;
    total_amount: number;
    today_amount: number;
    this_month_amount: number;
};

type Props = {
    expenses: {
        data: Expense[];
        links: PaginationLink[];
    };
    stats: Stats;
    categories: Category[];
    filters: {
        search?: string;
        category_id?: number;
        from_date?: string;
        to_date?: string;
    };
};

export default function ExpensesIndex({
    expenses,
    stats,
    categories,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
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
                '/dashboard/expenses',
                {
                    ...(search && { search }),
                    ...(filters.category_id && {
                        category_id: filters.category_id,
                    }),
                    ...(filters.from_date && { from_date: filters.from_date }),
                    ...(filters.to_date && { to_date: filters.to_date }),
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const handleDelete = (expenseId: number) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            router.delete(`/dashboard/expenses/${expenseId}`);
        }
    };

    const handleFilter = (key: string, value: string | null) => {
        router.get(
            '/dashboard/expenses',
            {
                ...(search && { search }),
                ...(filters.category_id && {
                    category_id: filters.category_id,
                }),
                ...(filters.from_date && { from_date: filters.from_date }),
                ...(filters.to_date && { to_date: filters.to_date }),
                ...(value && { [key]: value }),
                ...(!value && { [key]: undefined }),
            },
            { preserveState: true, replace: true },
        );
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
            month: 'short',
            day: 'numeric',
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
                                Expenses
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Track and manage business expenses
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/dashboard/expenses/categories"
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                Categories
                            </Link>
                            <Link
                                href="/dashboard/expenses/create"
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" />
                                Add Expense
                            </Link>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Expenses
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-card-foreground">
                                        {stats.total_expenses}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted p-2">
                                    <Receipt className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Today
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-amber-600">
                                        {formatCurrency(stats.today_amount)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-amber-500/10 p-2">
                                    <Calendar className="h-5 w-5 text-amber-600" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        This Month
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-blue-600">
                                        {formatCurrency(
                                            stats.this_month_amount,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Amount
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-red-600">
                                        {formatCurrency(stats.total_amount)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-red-500/10 p-2">
                                    <Wallet className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="mb-6 space-y-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search expenses..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-card py-2.5 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                                    showFilters ||
                                    filters.category_id ||
                                    filters.from_date
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border text-foreground hover:bg-muted'
                                }`}
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </button>
                        </div>

                        {showFilters && (
                            <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-card p-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                        Category
                                    </label>
                                    <select
                                        value={filters.category_id || ''}
                                        onChange={(e) =>
                                            handleFilter(
                                                'category_id',
                                                e.target.value || null,
                                            )
                                        }
                                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.from_date || ''}
                                        onChange={(e) =>
                                            handleFilter(
                                                'from_date',
                                                e.target.value || null,
                                            )
                                        }
                                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.to_date || ''}
                                        onChange={(e) =>
                                            handleFilter(
                                                'to_date',
                                                e.target.value || null,
                                            )
                                        }
                                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {expenses.data.map((expense) => (
                                    <tr
                                        key={expense.id}
                                        className="transition hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-foreground">
                                                {formatDate(
                                                    expense.expense_date,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                                                {expense.category.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="max-w-xs truncate text-sm text-muted-foreground">
                                                {expense.description || '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-semibold text-red-600">
                                                {formatCurrency(expense.amount)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/expenses/${expense.id}`}
                                                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/dashboard/expenses/${expense.id}/edit`}
                                                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(expense.id)
                                                    }
                                                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-12 text-center"
                                        >
                                            <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                No expenses found
                                            </p>
                                            <Link
                                                href="/dashboard/expenses/create"
                                                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add your first expense
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {expenses.links.length > 3 && (
                        <div className="mt-6">
                            <Paginator links={expenses.links} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
