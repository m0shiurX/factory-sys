import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Factory, Package, Search } from 'lucide-react';
import { FormEventHandler, useMemo, useRef, useState } from 'react';

type Product = {
    id: number;
    name: string;
    size: string | null;
    pieces_per_bundle: number;
    stock_pieces: number;
};

type Props = {
    products: Product[];
};

export default function ProductionCreate({ products }: Props) {
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const productSearchRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        product_id: null as number | null,
        pieces_produced: 0,
        production_date: new Date().toISOString().split('T')[0],
        note: '',
    });

    // Filtered products based on search
    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return products.slice(0, 10);
        const search = productSearch.toLowerCase();
        return products
            .filter(
                (p) =>
                    p.name.toLowerCase().includes(search) ||
                    p.size?.toLowerCase().includes(search),
            )
            .slice(0, 10);
    }, [productSearch, products]);

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setData('product_id', product.id);
        setProductSearch(
            product.name + (product.size ? ` (${product.size})` : ''),
        );
        setShowProductDropdown(false);
    };

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
        post('/dashboard/productions');
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Link
                            href="/dashboard/productions"
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Add Production Entry
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Record new production to add stock
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
                            {/* Product Selection */}
                            <div>
                                <label
                                    htmlFor="product"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Product *
                                </label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        ref={productSearchRef}
                                        type="text"
                                        id="product"
                                        value={productSearch}
                                        onChange={(e) => {
                                            setProductSearch(e.target.value);
                                            setShowProductDropdown(true);
                                        }}
                                        onFocus={() =>
                                            setShowProductDropdown(true)
                                        }
                                        className="w-full rounded-lg border border-border bg-background py-2.5 pr-4 pl-10 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        placeholder="Search for a product..."
                                    />
                                    {showProductDropdown &&
                                        filteredProducts.length > 0 && (
                                            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
                                                {filteredProducts.map(
                                                    (product) => (
                                                        <button
                                                            key={product.id}
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectProduct(
                                                                    product,
                                                                )
                                                            }
                                                            className="flex w-full items-center justify-between px-4 py-2.5 text-left transition hover:bg-muted"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </p>
                                                                {product.size && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Size:{' '}
                                                                        {
                                                                            product.size
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                Stock:{' '}
                                                                {formatStock(
                                                                    product.stock_pieces,
                                                                    product.pieces_per_bundle,
                                                                )}
                                                            </span>
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </div>
                                <InputError message={errors.product_id} />
                            </div>

                            {/* Selected Product Info */}
                            {selectedProduct && (
                                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            {selectedProduct.name}
                                            {selectedProduct.size && (
                                                <span className="ml-2 text-muted-foreground">
                                                    ({selectedProduct.size})
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Current Stock:{' '}
                                            {formatStock(
                                                selectedProduct.stock_pieces,
                                                selectedProduct.pieces_per_bundle,
                                            )}{' '}
                                            ({selectedProduct.stock_pieces} pcs)
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedProduct(null);
                                            setData('product_id', null);
                                            setProductSearch('');
                                        }}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Change
                                    </button>
                                </div>
                            )}

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
                                        placeholder="Enter quantity"
                                    />
                                    <InputError
                                        message={errors.pieces_produced}
                                    />
                                    {selectedProduct &&
                                        data.pieces_produced > 0 && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                ={' '}
                                                {formatStock(
                                                    data.pieces_produced,
                                                    selectedProduct.pieces_per_bundle,
                                                )}
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
                                href="/dashboard/productions"
                                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    !data.product_id ||
                                    !data.pieces_produced
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                            >
                                <Factory className="h-4 w-4" />
                                {processing
                                    ? 'Recording...'
                                    : 'Record Production'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
