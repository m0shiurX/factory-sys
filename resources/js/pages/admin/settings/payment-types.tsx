import AppLayout from '@/layouts/app-layout';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Plus, Trash2, X } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

type PaymentType = {
    id: number;
    name: string;
    is_active: boolean;
    sales_count: number;
    payments_count: number;
};

type Props = {
    paymentTypes: PaymentType[];
};

export default function PaymentTypesIndex({ paymentTypes }: Props) {
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
        addForm.post('/dashboard/settings/payment-types', {
            onSuccess: () => {
                addForm.reset();
                setShowAdd(false);
            },
        });
    };

    const startEdit = (type: PaymentType) => {
        setEditingId(type.id);
        editForm.setData({
            name: type.name,
            is_active: type.is_active,
        });
    };

    const handleEdit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingId) return;
        editForm.put(`/dashboard/settings/payment-types/${editingId}`, {
            onSuccess: () => {
                setEditingId(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (typeId: number) => {
        if (confirm('Are you sure you want to delete this payment type?')) {
            router.delete(`/dashboard/settings/payment-types/${typeId}`);
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
                                href="/dashboard/settings"
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    Payment Types
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Manage payment methods available for sales
                                    and payments
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Add Type
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
                                        Payment Type Name
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
                                        placeholder="e.g., Cash, Bank Transfer, bKash"
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
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAdd(false);
                                        addForm.reset();
                                    }}
                                    className="rounded-lg p-2.5 text-muted-foreground transition hover:bg-muted"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Payment Types List */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        {paymentTypes.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                No payment types found. Add one to get started.
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {paymentTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        className="flex items-center justify-between px-4 py-3"
                                    >
                                        {editingId === type.id ? (
                                            <form
                                                onSubmit={handleEdit}
                                                className="flex flex-1 items-center gap-3"
                                            >
                                                <input
                                                    type="text"
                                                    value={editForm.data.name}
                                                    onChange={(e) =>
                                                        editForm.setData(
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                                    autoFocus
                                                />
                                                <label className="flex items-center gap-2 text-sm">
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
                                                        className="rounded border-border"
                                                    />
                                                    Active
                                                </label>
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        editForm.processing
                                                    }
                                                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        editForm.reset();
                                                    }}
                                                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </form>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`font-medium ${!type.is_active ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                                                    >
                                                        {type.name}
                                                    </span>
                                                    {!type.is_active && (
                                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                            Inactive
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        {type.sales_count +
                                                            type.payments_count >
                                                            0
                                                            ? `${type.sales_count} sales, ${type.payments_count} payments`
                                                            : 'Not used yet'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEdit(type)
                                                        }
                                                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                type.id,
                                                            )
                                                        }
                                                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
