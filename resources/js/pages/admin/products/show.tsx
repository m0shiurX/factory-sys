import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Box,
    Calendar,
    Edit,
    Gauge,
    Package,
    Ruler,
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
                        <Link
                            href="/dashboard/products"
                            className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Products</span>
                        </Link>
                        <Link
                            href={`/dashboard/products/${product.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Link>
                    </div>

                    {/* Product Card */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        {/* Card Header */}
                        <div className={`px-6 py-5 ${isLowStock ? 'bg-linear-to-r from-amber-500 to-amber-600' : 'bg-linear-to-r from-emerald-500 to-emerald-600'}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Package className="h-6 w-6 text-white" />
                                        <h1 className="text-2xl font-bold text-white">
                                            {product.name}
                                        </h1>
                                    </div>
                                    {product.size && (
                                        <p className="mt-1 text-white/80">
                                            Size: {product.size}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-white">
                                        {formatCurrency(product.rate_per_kg)}
                                    </p>
                                    <p className="text-xs tracking-wide text-white/80 uppercase">
                                        Rate per KG
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status & Meta Bar */}
                        <div className="border-b border-border px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span
                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${product.is_active
                                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                                : 'border-border bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {product.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    {isLowStock && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
                                            <AlertTriangle className="h-3 w-3" />
                                            Low Stock
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Added {formatDate(product.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Product Details & Stock */}
                        <div className="px-6 py-5">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Product Name */}
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <Box className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Product
                                        </p>
                                    </div>
                                    <p className="mt-2 text-lg font-bold text-foreground">
                                        {product.name}
                                    </p>
                                </div>

                                {/* Size */}
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <Ruler className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Size
                                        </p>
                                    </div>
                                    <p className="mt-2 text-lg font-bold text-foreground">
                                        {product.size || 'N/A'}
                                    </p>
                                </div>

                                {/* Pieces per Bundle */}
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Pcs / Bundle
                                        </p>
                                    </div>
                                    <p className="mt-2 text-lg font-bold text-foreground">
                                        {product.pieces_per_bundle}
                                    </p>
                                </div>

                                {/* Rate */}
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <Scale className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Rate / KG
                                        </p>
                                    </div>
                                    <p className="mt-2 text-lg font-bold font-mono text-foreground">
                                        {formatCurrency(product.rate_per_kg)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stock Section */}
                        <div className="border-t border-border px-6 py-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Current Stock */}
                                <div className={`rounded-lg p-4 ${isLowStock ? 'bg-amber-500/10' : 'bg-muted/50'}`}>
                                    <div className="flex items-center gap-2">
                                        {isLowStock && (
                                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                                        )}
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Current Stock
                                        </p>
                                    </div>
                                    <p className={`mt-2 text-2xl font-bold ${isLowStock ? 'text-amber-600' : 'text-foreground'}`}>
                                        {formatStock(product.stock_pieces, product.pieces_per_bundle)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        ({product.stock_pieces} pieces total)
                                    </p>
                                </div>

                                {/* Low Stock Alert */}
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <Gauge className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Low Stock Alert
                                        </p>
                                    </div>
                                    <p className="mt-2 text-2xl font-bold text-foreground">
                                        {product.min_stock_alert > 0
                                            ? `${product.min_stock_alert} pcs`
                                            : 'Disabled'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border bg-muted/30 px-6 py-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Created {formatDate(product.created_at)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Updated {formatDate(product.updated_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
