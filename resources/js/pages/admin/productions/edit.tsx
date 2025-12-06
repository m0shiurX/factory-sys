import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Package, Save } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';
import { toast } from 'sonner';

type Product = {
    id: number;
    name: string;
    size: string | null;
    pieces_per_bundle: number;
    stock_pieces: number;
};

type Production = {
    id: number;
    product_id: number;
    pieces_produced: number;
    production_date: string;
    note: string | null;
    product: Product;
};

type Props = {
    production: Production;
};

export default function ProductionEdit({ production }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const { data, setData, put, processing, errors } = useForm({
        pieces_produced: production.pieces_produced,
        production_date: production.production_date,
        note: production.note || '',
    });

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
    }, [props.flash?.success]);

    const formatStock = (pieces: number, piecesPerBundle: number) => {
        const bundles = Math.floor(pieces / piecesPerBundle);
        const remaining = pieces % piecesPerBundle;
        if (remaining > 0) {
            return `${bundles} bdl + ${remaining} pcs`;
        }
        return bundles > 0 ? `${bundles} bdl` : `${pieces} pcs`;
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/dashboard/productions/${production.id}`);
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Link
                            href={`/dashboard/productions/${production.id}`}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Edit Production Entry
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Update production record
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
                            {/* Product Info (Read-only) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Product
                                </label>
                                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            {production.product.name}
                                            {production.product.size && (
                                                <span className="ml-2 text-muted-foreground">
                                                    ({production.product.size})
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Current Stock:{' '}
                                            {formatStock(
                                                production.product.stock_pieces,
                                                production.product
                                                    .pieces_per_bundle,
                                            )}{' '}
                                            ({production.product.stock_pieces}{' '}
                                            pcs)
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                    Product cannot be changed. Delete this entry
                                    and create a new one if needed.
                                </p>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Pieces Produced */}
                                <div>
                                    <label
                                        htmlFor="pieces_produced"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Pieces Produced *
                                    </label>
                                    <input
                                        type="number"
                                        id="pieces_produced"
                                        value={data.pieces_produced || ''}
                                        onChange={(e) =>
                                            setData(
                                                'pieces_produced',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        min="1"
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    <InputError
                                        message={errors.pieces_produced}
                                    />
                                    {data.pieces_produced > 0 && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            ={' '}
                                            {formatStock(
                                                data.pieces_produced,
                                                production.product
                                                    .pieces_per_bundle,
                                            )}
                                        </p>
                                    )}
                                    {data.pieces_produced !==
                                        production.pieces_produced && (
                                        <p className="mt-1 text-xs text-amber-600">
                                            Stock will be adjusted by{' '}
                                            {data.pieces_produced -
                                                production.pieces_produced >
                                            0
                                                ? '+'
                                                : ''}
                                            {data.pieces_produced -
                                                production.pieces_produced}{' '}
                                            pcs
                                        </p>
                                    )}
                                </div>

                                {/* Production Date */}
                                <div>
                                    <label
                                        htmlFor="production_date"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Production Date *
                                    </label>
                                    <input
                                        type="date"
                                        id="production_date"
                                        value={data.production_date}
                                        onChange={(e) =>
                                            setData(
                                                'production_date',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    <InputError
                                        message={errors.production_date}
                                    />
                                </div>
                            </div>

                            {/* Note */}
                            <div>
                                <label
                                    htmlFor="note"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Note
                                </label>
                                <textarea
                                    id="note"
                                    value={data.note}
                                    onChange={(e) =>
                                        setData('note', e.target.value)
                                    }
                                    rows={3}
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="Optional notes about this production..."
                                />
                                <InputError message={errors.note} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Link
                                href={`/dashboard/productions/${production.id}`}
                                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || !data.pieces_produced}
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
