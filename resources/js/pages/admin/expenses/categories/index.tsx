import AppLayout from '@/layouts/app-layout';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Plus, Trash2, X } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

type Category = {
    id: number;
    name: string;
    is_active: boolean;
    expenses_count: number;
};

type Props = {
    categories: Category[];
};

export default function CategoriesIndex({ categories }: Props) {
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { props } = usePage<{
        flash?: { success?: string; error?: string };
    }>();

    const addForm = useForm({
        name: '',
    });

    const editForm = useForm({
        name: '',
        is_active: true,
    });

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash?.success, props.flash?.error]);

    const handleAdd: FormEventHandler = (e) => {
        e.preventDefault();
        addForm.post('/dashboard/expenses/categories', {
            onSuccess: () => {
                addForm.reset();
                setShowAdd(false);
            },
        });
    };

    const startEdit = (category: Category) => {
        setEditingId(category.id);
        editForm.setData({
            name: category.name,
            is_active: category.is_active,
        });
    };

    const handleEdit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingId) return;
        editForm.put(`/dashboard/expenses/categories/${editingId}`, {
            onSuccess: () => {
                setEditingId(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (categoryId: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/dashboard/expenses/categories/${categoryId}`);
        }
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
                                    Expense Categories
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Manage expense categories
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Add Category
                        </button>
                    </div>

                    {/* Add Form */}
                    {showAdd && (
                        <form
                            onSubmit={handleAdd}
                            className="mb-6 rounded-xl border border-border bg-card p-4"
                        >
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={addForm.data.name}
                                        onChange={(e) =>
                                            addForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        placeholder="e.g., Utilities, Transport, Office Supplies"
                                        autoFocus
                                    />
                                    {addForm.errors.name && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {addForm.errors.name}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={
                                        addForm.processing ||
                                        !addForm.data.name.trim()
                                    }
                                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {addForm.processing ? 'Adding...' : 'Add'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAdd(false);
                                        addForm.reset();
                                    }}
                                    className="rounded-lg border border-border p-2.5 text-muted-foreground transition hover:bg-muted"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Categories List */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="divide-y divide-border">
                            {categories.map((category) => (
                                <div key={category.id} className="p-4">
                                    {editingId === category.id ? (
                                        <form
                                            onSubmit={handleEdit}
                                            className="flex items-end gap-4"
                                        >
                                            <div className="flex-1">
                                                <label className="mb-2 block text-sm font-medium text-foreground">
                                                    Category Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.data.name}
                                                    onChange={(e) =>
                                                        editForm.setData(
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="flex items-center gap-2 text-sm text-foreground">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            editForm.data
                                                                .is_active
                                                        }
                                                        onChange={(e) =>
                                                            editForm.setData(
                                                                'is_active',
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-border"
                                                    />
                                                    Active
                                                </label>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={
                                                    editForm.processing ||
                                                    !editForm.data.name.trim()
                                                }
                                                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingId(null);
                                                    editForm.reset();
                                                }}
                                                className="rounded-lg border border-border p-2.5 text-muted-foreground transition hover:bg-muted"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-foreground">
                                                    {category.name}
                                                </span>
                                                {!category.is_active && (
                                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                        Inactive
                                                    </span>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {category.expenses_count}{' '}
                                                    expenses
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        startEdit(category)
                                                    }
                                                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            category.id,
                                                        )
                                                    }
                                                    disabled={
                                                        category.expenses_count >
                                                        0
                                                    }
                                                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                    title={
                                                        category.expenses_count >
                                                        0
                                                            ? 'Cannot delete category with expenses'
                                                            : 'Delete category'
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <div className="p-12 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No categories yet. Create your first
                                        one!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
