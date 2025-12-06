import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Edit,
    Factory,
    Package,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Product = {
    id: number;
    name: string;
    size: string | null;
    pieces_per_bundle: number;
    stock_pieces: number;
};

type CreatedByUser = {
    id: number;
    name: string;
};

type Production = {
    id: number;
    pieces_produced: number;
    production_date: string;
    note: string | null;
    product: Product;
    created_by_user: CreatedByUser | null;
    created_at: string;
    updated_at: string;
};

type Props = {
    production: Production;
};

export default function ProductionShow({ production }: Props) {
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
        if (
            confirm(
                'Are you sure you want to delete this production entry? This will reduce the product stock.',
            )
        ) {
            router.delete(`/dashboard/productions/${production.id}`);
        }
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

    const formatStock = (pieces: number, piecesPerBundle: number) => {
        const bundles = Math.floor(pieces / piecesPerBundle);
        const remaining = pieces % piecesPerBundle;
        if (remaining > 0) {
            return `${bundles} bdl + ${remaining} pcs`;
        }
        return bundles > 0 ? `${bundles} bdl` : `${pieces} pcs`;
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/productions"
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    Production Details
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Entry #{production.id}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/dashboard/productions/${production.id}/edit`}
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

                    {/* Production Info Card */}
                    <div className="rounded-xl border border-border bg-card">
                        {/* Header Section */}
                        <div className="border-b border-border p-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-emerald-500/10 p-4">
                                    <Factory className="h-8 w-8 text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        Production Entry
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                        +
                                        {production.pieces_produced.toLocaleString()}{' '}
                                        pcs
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatStock(
                                            production.pieces_produced,
                                            production.product
                                                .pieces_per_bundle,
                                        )}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">
                                            {formatDate(
                                                production.production_date,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Section */}
                        <div className="border-b border-border p-6">
                            <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                                Product Information
                            </h3>
                            <Link
                                href={`/dashboard/products/${production.product.id}`}
                                className="flex items-center gap-4 rounded-lg border border-border p-4 transition hover:bg-muted/50"
                            >
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <Package className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">
                                        {production.product.name}
                                    </p>
                                    {production.product.size && (
                                        <p className="text-sm text-muted-foreground">
                                            Size: {production.product.size}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">
                                        Current Stock
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {formatStock(
                                            production.product.stock_pieces,
                                            production.product
                                                .pieces_per_bundle,
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        ({production.product.stock_pieces} pcs)
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Note Section */}
                        {production.note && (
                            <div className="border-b border-border p-6">
                                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                                    Note
                                </h3>
                                <p className="text-sm text-foreground">
                                    {production.note}
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
                                            {production.created_by_user?.name ||
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
                                            {formatDateTime(
                                                production.created_at,
                                            )}
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
