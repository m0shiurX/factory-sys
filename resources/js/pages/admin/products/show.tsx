import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Box,
    Calendar,
    Edit,
    Package,
    Scale,
} from 'lucide-react';
import { useEffect } from 'react';
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
    created_at: string;
    updated_at: string;
};

type Props = {
    product: Product;
};

export default function ProductShow({ product }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
    }, [props.flash?.success]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatStock = (pieces: number, piecesPerBundle: number) => {
        const bundles = Math.floor(pieces / piecesPerBundle);
        const remaining = pieces % piecesPerBundle;
        if (remaining > 0) {
            return `${bundles} bundles + ${remaining} pieces`;
        }
        return `${bundles} bundles`;
    };

    const isLowStock =
        product.min_stock_alert > 0 &&
        product.stock_pieces <= product.min_stock_alert;

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/products"
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    {product.name}
                                    {product.size && (
                                        <span className="ml-2 text-lg font-normal text-muted-foreground">
                                            ({product.size})
                                        </span>
                                    )}
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Added on {formatDate(product.created_at)}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/products/${product.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Link>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Info */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Product Details */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">
                                    Product Details
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Box className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Product Name
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {product.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Scale className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Size
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {product.size || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Pieces per Bundle
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {product.pieces_per_bundle}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Scale className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Rate per KG
                                            </p>
                                            <p className="font-mono font-medium text-foreground">
                                                {formatCurrency(
                                                    product.rate_per_kg,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Info */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">
                                    Stock Information
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div
                                        className={`rounded-lg p-4 ${isLowStock ? 'bg-amber-500/10' : 'bg-muted/50'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isLowStock && (
                                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Current Stock
                                            </p>
                                        </div>
                                        <p
                                            className={`mt-1 text-xl font-semibold ${isLowStock ? 'text-amber-600' : 'text-foreground'}`}
                                        >
                                            {formatStock(
                                                product.stock_pieces,
                                                product.pieces_per_bundle,
                                            )}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            ({product.stock_pieces} pieces)
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Low Stock Alert
                                        </p>
                                        <p className="mt-1 text-xl font-semibold text-foreground">
                                            {product.min_stock_alert > 0
                                                ? `${product.min_stock_alert} pieces`
                                                : 'Disabled'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">
                                    Status
                                </h2>
                                <span
                                    className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${
                                        product.is_active
                                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                            : 'border-border bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Timestamps */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">
                                    Timeline
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Created
                                            </p>
                                            <p className="text-sm font-medium text-foreground">
                                                {formatDate(product.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Last Updated
                                            </p>
                                            <p className="text-sm font-medium text-foreground">
                                                {formatDate(product.updated_at)}
                                            </p>
                                        </div>
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
