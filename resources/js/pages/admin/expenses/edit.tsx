import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';
import { toast } from 'sonner';

type Category = {
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
};

type Props = {
    expense: Expense;
    categories: Category[];
};

export default function ExpenseEdit({ expense, categories }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const { data, setData, put, processing, errors } = useForm({
        expense_category_id: expense.expense_category_id,
        amount: expense.amount,
        expense_date: expense.expense_date,
        description: expense.description || '',
    });

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
    }, [props.flash?.success]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/dashboard/expenses/${expense.id}`);
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Link
                            href={`/dashboard/expenses/${expense.id}`}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Edit Expense
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Update expense details
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
                            {/* Category */}
                            <div>
                                <label
                                    htmlFor="expense_category_id"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Category *
                                </label>
                                <select
                                    id="expense_category_id"
                                    value={data.expense_category_id}
                                    onChange={(e) =>
                                        setData(
                                            'expense_category_id',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.expense_category_id}
                                />
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Amount */}
                                <div>
                                    <label
                                        htmlFor="amount"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Amount (৳) *
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={data.amount || ''}
                                        onChange={(e) =>
                                            setData(
                                                'amount',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        min="0.01"
                                        step="0.01"
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    <InputError message={errors.amount} />
                                </div>

                                {/* Date */}
                                <div>
                                    <label
                                        htmlFor="expense_date"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        id="expense_date"
                                        value={data.expense_date}
                                        onChange={(e) =>
                                            setData(
                                                'expense_date',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    <InputError message={errors.expense_date} />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={3}
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="Optional details about this expense..."
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Link
                                href={`/dashboard/expenses/${expense.id}`}
                                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    !data.expense_category_id ||
                                    !data.amount
                                }
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
