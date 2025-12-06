import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';
import { toast } from 'sonner';

type Product = {
    id: number;
    name: string;
    size: string | null;
    pieces_per_bundle: number;
    rate_per_kg: number;
    stock_pieces: number;
    min_stock_alert: number;
    is_active: boolean;
};

type Props = {
    product: Product;
};

export default function ProductEdit({ product }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
        size: product.size || '',
        pieces_per_bundle: product.pieces_per_bundle,
        rate_per_kg: product.rate_per_kg,
        stock_pieces: product.stock_pieces,
        min_stock_alert: product.min_stock_alert,
        is_active: product.is_active,
    });

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
    }, [props.flash?.success]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/dashboard/products/${product.id}`);
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Link
                            href={`/dashboard/products/${product.id}`}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Edit Product
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Update product information
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
                            {/* Product Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="e.g., Iron Pan"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Size */}
                            <div>
                                <label
                                    htmlFor="size"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Size
                                </label>
                                <input
                                    type="text"
                                    id="size"
                                    value={data.size}
                                    onChange={(e) =>
                                        setData('size', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    placeholder="e.g., 12-inch"
                                />
                                <InputError message={errors.size} />
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Pieces per Bundle */}
                                <div>
                                    <label
                                        htmlFor="pieces_per_bundle"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Pieces per Bundle *
                                    </label>
                                    <input
                                        type="number"
                                        id="pieces_per_bundle"
                                        value={data.pieces_per_bundle}
                                        onChange={(e) =>
                                            setData(
                                                'pieces_per_bundle',
                                                parseInt(e.target.value) || 1,
                                            )
                                        }
                                        min="1"
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    <InputError
                                        message={errors.pieces_per_bundle}
                                    />
                                </div>

                                {/* Rate per KG */}
                                <div>
                                    <label
                                        htmlFor="rate_per_kg"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Rate per KG (৳) *
                                    </label>
                                    <input
                                        type="number"
                                        id="rate_per_kg"
                                        value={data.rate_per_kg}
                                        onChange={(e) =>
                                            setData(
                                                'rate_per_kg',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    <InputError message={errors.rate_per_kg} />
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Current Stock */}
                                <div>
                                    <label
                                        htmlFor="stock_pieces"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Current Stock (pieces)
                                    </label>
                                    <input
                                        type="number"
                                        id="stock_pieces"
                                        value={data.stock_pieces}
                                        onChange={(e) =>
                                            setData(
                                                'stock_pieces',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        min="0"
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    <InputError message={errors.stock_pieces} />
                                </div>

                                {/* Min Stock Alert */}
                                <div>
                                    <label
                                        htmlFor="min_stock_alert"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Low Stock Alert (pieces)
                                    </label>
                                    <input
                                        type="number"
                                        id="min_stock_alert"
                                        value={data.min_stock_alert}
                                        onChange={(e) =>
                                            setData(
                                                'min_stock_alert',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        min="0"
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    <InputError
                                        message={errors.min_stock_alert}
                                    />
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <label
                                    htmlFor="is_active"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Active product (visible in sales)
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Link
                                href={`/dashboard/products/${product.id}`}
                                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
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
