import InputError from '@/components/common/input-error';
import { useSearchableDropdown } from '@/hooks/use-searchable-dropdown';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    Plus,
    RotateCcw,
    Search,
    ShoppingBag,
    Trash2,
    User,
    Weight,
} from 'lucide-react';
import { FormEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
};

type Product = {
    id: number;
    name: string;
    size: string | null;
    pieces_per_bundle: number;
    rate_per_kg: number;
    stock_pieces: number;
};

type Sale = {
    id: number;
    bill_no: string;
    customer_id: number;
    sale_date: string;
    net_amount: number;
    customer: { id: number; name: string } | null;
};

type SalesReturnItem = {
    id?: number;
    product_id: number | null;
    description?: string;
    bundles: number;
    extra_pieces: number;
    total_pieces: number;
    weight_kg: number;
    rate_per_kg: number;
    sub_total: number;
    product?: Product;
};

type ReturnItem = {
    product_id: number | null;
    description: string;
    product_name: string;
    product_size: string | null;
    pieces_per_bundle: number;
    bundles: number;
    extra_pieces: number;
    total_pieces: number;
    weight_kg: number;
    rate_per_kg: number;
    sub_total: number;
};

type SalesReturn = {
    id: number;
    return_no: string;
    customer_id: number;
    sale_id: number | null;
    return_date: string;
    is_scrap_purchase: boolean;
    total_weight: number;
    sub_total: number;
    discount: number;
    grand_total: number;
    note: string | null;
    customer: Customer;
    sale: Sale | null;
    items: SalesReturnItem[];
};

type Props = {
    salesReturn: SalesReturn;
    customers: Customer[];
    products: Product[];
    sales: Sale[];
};

export default function SalesReturnEdit({
    salesReturn,
    customers,
    products,
    sales,
}: Props) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        salesReturn.customer,
    );
    const [, setSelectedSale] = useState<Sale | null>(salesReturn.sale || null);
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [customerSearch, setCustomerSearch] = useState(
        salesReturn.customer?.name || '',
    );
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [saleSearch, setSaleSearch] = useState(
        salesReturn.sale?.bill_no || '',
    );
    const [showSaleDropdown, setShowSaleDropdown] = useState(false);
    const [showExtraPieces, setShowExtraPieces] = useState(
        salesReturn.items.some((item) => item.extra_pieces > 0),
    );
    const productSearchRef = useRef<HTMLInputElement>(null);
    const customerSearchRef = useRef<HTMLInputElement>(null);
    const saleSearchRef = useRef<HTMLInputElement>(null);
    const discountRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const bundleInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const weightInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [scrapDescription, setScrapDescription] = useState('');
    const [scrapWeight, setScrapWeight] = useState('');
    const [scrapRate, setScrapRate] = useState('');
    const scrapDescRef = useRef<HTMLInputElement>(null);

    // Transform existing items
    const initialItems: ReturnItem[] = salesReturn.items.map((item) => ({
        product_id: item.product_id,
        description: item.description || '',
        product_name: item.product?.name || '',
        product_size: item.product?.size || null,
        pieces_per_bundle: item.product?.pieces_per_bundle || 0,
        bundles: item.bundles,
        extra_pieces: item.extra_pieces,
        total_pieces: item.total_pieces,
        weight_kg: Number(item.weight_kg),
        rate_per_kg: Number(item.rate_per_kg),
        sub_total: Number(item.sub_total),
    }));

    const { data, setData, put, processing, errors } = useForm<{
        customer_id: number | null;
        sale_id: number | null;
        return_date: string;
        is_scrap_purchase: boolean;
        total_weight: number;
        sub_total: number;
        discount: number;
        grand_total: number;
        note: string;
        items: ReturnItem[];
    }>({
        customer_id: salesReturn.customer_id,
        sale_id: salesReturn.sale_id,
        return_date: salesReturn.return_date.split('T')[0],
        is_scrap_purchase: salesReturn.is_scrap_purchase,
        total_weight: Number(salesReturn.total_weight),
        sub_total: Number(salesReturn.sub_total),
        discount: Number(salesReturn.discount),
        grand_total: Number(salesReturn.grand_total),
        note: salesReturn.note || '',
        items: initialItems,
    });

    // Filtered lists
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

    const filteredCustomers = useMemo(() => {
        if (!customerSearch.trim()) return customers.slice(0, 10);
        const search = customerSearch.toLowerCase();
        return customers
            .filter(
                (c) =>
                    c.name.toLowerCase().includes(search) ||
                    c.phone?.toLowerCase().includes(search),
            )
            .slice(0, 10);
    }, [customerSearch, customers]);

    const filteredSales = useMemo(() => {
        if (!saleSearch.trim()) return sales.slice(0, 10);
        const search = saleSearch.toLowerCase();
        return sales
            .filter(
                (s) =>
                    s.bill_no.toLowerCase().includes(search) ||
                    s.customer?.name.toLowerCase().includes(search),
            )
            .slice(0, 10);
    }, [saleSearch, sales]);

    const productDropdown = useSearchableDropdown({
        items: filteredProducts,
        onSelect: handleAddProductInternal,
        isOpen: showProductDropdown,
        setIsOpen: setShowProductDropdown,
        inputRef: productSearchRef,
    });

    const customerDropdown = useSearchableDropdown({
        items: filteredCustomers,
        onSelect: handleSelectCustomerInternal,
        isOpen: showCustomerDropdown,
        setIsOpen: setShowCustomerDropdown,
        inputRef: customerSearchRef,
    });

    const saleDropdown = useSearchableDropdown({
        items: filteredSales,
        onSelect: handleSelectSaleInternal,
        isOpen: showSaleDropdown,
        setIsOpen: setShowSaleDropdown,
        inputRef: saleSearchRef,
    });

    // Calculate totals
    useEffect(() => {
        const totalWeight = data.items.reduce(
            (sum, item) => sum + Number(item.weight_kg),
            0,
        );
        const subTotal = data.items.reduce(
            (sum, item) => sum + item.sub_total,
            0,
        );
        const grandTotal = subTotal - (data.discount || 0);

        setData((prev) => ({
            ...prev,
            total_weight: Number(totalWeight.toFixed(2)),
            sub_total: Number(subTotal.toFixed(2)),
            grand_total: Number(grandTotal.toFixed(2)),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.items, data.discount]);

    function handleSelectCustomerInternal(customer: Customer) {
        setSelectedCustomer(customer);
        setData('customer_id', customer.id);
        setCustomerSearch(customer.name);
        setShowCustomerDropdown(false);
        setTimeout(() => productSearchRef.current?.focus(), 50);
    }

    function handleSelectSaleInternal(selectedSaleItem: Sale) {
        setSelectedSale(selectedSaleItem);
        setData('sale_id', selectedSaleItem.id);
        setSaleSearch(selectedSaleItem.bill_no);
        setShowSaleDropdown(false);

        if (selectedSaleItem.customer) {
            const customer = customers.find(
                (c) => c.id === selectedSaleItem.customer_id,
            );
            if (customer) {
                handleSelectCustomerInternal(customer);
            }
        }
    }

    function handleAddProductInternal(product: Product) {
        const existingIndex = data.items.findIndex(
            (item) => item.product_id === product.id,
        );

        if (existingIndex >= 0) {
            const newItems = [...data.items];
            newItems[existingIndex].bundles += 1;
            newItems[existingIndex].total_pieces =
                newItems[existingIndex].bundles * product.pieces_per_bundle +
                newItems[existingIndex].extra_pieces;
            setData('items', newItems);
            setProductSearch('');
            setShowProductDropdown(false);
            setTimeout(() => bundleInputRefs.current[existingIndex]?.focus(), 50);
        } else {
            const newItem: ReturnItem = {
                product_id: product.id,
                description: '',
                product_name: product.name,
                product_size: product.size,
                pieces_per_bundle: product.pieces_per_bundle,
                bundles: 1,
                extra_pieces: 0,
                total_pieces: product.pieces_per_bundle,
                weight_kg: 0,
                rate_per_kg: product.rate_per_kg,
                sub_total: 0,
            };
            setData('items', [...data.items, newItem]);
            setProductSearch('');
            setShowProductDropdown(false);
            const newIndex = data.items.length;
            setTimeout(() => bundleInputRefs.current[newIndex]?.focus(), 50);
        }
    }

    const updateItem = (
        index: number,
        field: keyof ReturnItem,
        value: number,
    ) => {
        const newItems = [...data.items];
        const item = newItems[index];

        if (field === 'bundles' || field === 'extra_pieces') {
            (item as ReturnItem)[field] = value;
            item.total_pieces =
                item.bundles * item.pieces_per_bundle + item.extra_pieces;
        } else if (field === 'weight_kg') {
            item.weight_kg = value;
            item.sub_total = Number((value * item.rate_per_kg).toFixed(2));
        } else if (field === 'rate_per_kg') {
            item.rate_per_kg = value;
            item.sub_total = Number((item.weight_kg * value).toFixed(2));
        }

        setData('items', newItems);
    };

    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    function handleAddScrapItem() {
        if (!scrapDescription.trim()) {
            toast.error('Please enter a description');
            scrapDescRef.current?.focus();
            return;
        }
        const weight = parseFloat(scrapWeight) || 0;
        const rate = parseFloat(scrapRate) || 0;
        const newItem: ReturnItem = {
            product_id: null,
            description: scrapDescription.trim(),
            product_name: '',
            product_size: null,
            pieces_per_bundle: 0,
            bundles: 0,
            extra_pieces: 0,
            total_pieces: 0,
            weight_kg: weight,
            rate_per_kg: rate,
            sub_total: Number((weight * rate).toFixed(2)),
        };
        setData('items', [...data.items, newItem]);
        setScrapDescription('');
        setScrapWeight('');
        setScrapRate('');
        setTimeout(() => scrapDescRef.current?.focus(), 50);
    }

    const updateScrapDescription = (index: number, value: string) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], description: value };
        setData('items', newItems);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.customer_id) {
            toast.error('Please select a customer');
            return;
        }

        if (data.items.length === 0) {
            toast.error(data.is_scrap_purchase ? 'Please add at least one scrap item' : 'Please add at least one product');
            return;
        }

        if (data.is_scrap_purchase) {
            const missingDesc = data.items.some((item) => !item.description?.trim());
            if (missingDesc) {
                toast.error('Please enter description for all scrap items');
                return;
            }
        }

        const missingWeight = data.items.some((item) => item.weight_kg <= 0);
        if (missingWeight) {
            toast.error('Please enter weight for all items');
            return;
        }

        put(`/dashboard/sales-returns/${salesReturn.id}`, {
            onSuccess: () => {
                toast.success('Sales return updated successfully');
            },
        });
    };

    const handleProductSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.shiftKey && e.key === 'Enter') {
            e.preventDefault();
            discountRef.current?.focus();
            return;
        }
        productDropdown.handleKeyDown(e);
    }, [productDropdown]);

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                formRef.current?.requestSubmit();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // Prevent Enter from submitting the form (allow on buttons)
    const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLButtonElement)) {
            e.preventDefault();
        }
    };

    // Enter/Tab navigation: bundle → weight
    const handleBundleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
            e.preventDefault();
            weightInputRefs.current[index]?.focus();
        }
    };

    // Enter/Tab navigation: weight → next bundle or product search
    const handleWeightKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
            e.preventDefault();
            if (index < data.items.length - 1) {
                bundleInputRefs.current[index + 1]?.focus();
            } else {
                productSearchRef.current?.focus();
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/dashboard/sales-returns/${salesReturn.id}`}
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    {data.is_scrap_purchase ? 'Edit Scrap Purchase' : 'Edit Sales Return'}
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {salesReturn.return_no}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setData((prev) => ({
                                    ...prev,
                                    is_scrap_purchase: !prev.is_scrap_purchase,
                                    items: [],
                                }));
                            }}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${data.is_scrap_purchase
                                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                                    : 'border border-border text-muted-foreground hover:bg-muted'
                                }`}
                        >
                            <ShoppingBag className="h-4 w-4" />
                            {data.is_scrap_purchase ? 'Scrap Mode' : 'Switch to Scrap'}
                        </button>
                    </div>

                    <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
                        {/* Return Header */}
                        <div className="mb-6 grid gap-4 md:grid-cols-4">
                            {/* Return No & Date */}
                            <div className="rounded-xl border border-border bg-card p-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                            Return No
                                        </label>
                                        <p className="text-lg font-semibold text-foreground">
                                            {salesReturn.return_no}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.return_date}
                                            onChange={(e) =>
                                                setData(
                                                    'return_date',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        />
                                        <InputError
                                            message={errors.return_date}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Against Sale */}
                            <div className="rounded-xl border border-border bg-card p-4">
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                                    Against Sale (Optional)
                                </label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        ref={saleSearchRef}
                                        type="text"
                                        placeholder="Search sale..."
                                        value={saleSearch}
                                        onChange={(e) => {
                                            setSaleSearch(e.target.value);
                                            setShowSaleDropdown(true);
                                            if (!e.target.value) {
                                                setSelectedSale(null);
                                                setData('sale_id', null);
                                            }
                                        }}
                                        onFocus={() =>
                                            setShowSaleDropdown(true)
                                        }
                                        onKeyDown={saleDropdown.handleKeyDown}
                                        className="w-full rounded-lg border border-border bg-background py-2 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    {showSaleDropdown &&
                                        filteredSales.length > 0 && (
                                            <div ref={saleDropdown.dropdownRef} className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
                                                {filteredSales.map((s, index) => (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        {...saleDropdown.getItemProps(index)}
                                                        onClick={() =>
                                                            handleSelectSaleInternal(s)
                                                        }
                                                        onMouseEnter={() => saleDropdown.setHighlightedIndex(index)}
                                                        className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-muted ${saleDropdown.getItemProps(index).className}`}
                                                    >
                                                        <div>
                                                            <p className="font-medium">
                                                                {s.bill_no}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    s.customer
                                                                        ?.name
                                                                }
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatCurrency(
                                                                s.net_amount,
                                                            )}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Customer Select */}
                            <div className="rounded-xl border border-border bg-card p-4">
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                                    Customer *
                                </label>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        ref={customerSearchRef}
                                        type="text"
                                        placeholder="Search customer..."
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setShowCustomerDropdown(true);
                                            if (!e.target.value) {
                                                setSelectedCustomer(null);
                                                setData('customer_id', null);
                                            }
                                        }}
                                        onFocus={() =>
                                            setShowCustomerDropdown(true)
                                        }
                                        onKeyDown={customerDropdown.handleKeyDown}
                                        className="w-full rounded-lg border border-border bg-background py-2 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    {showCustomerDropdown &&
                                        filteredCustomers.length > 0 && (
                                            <div ref={customerDropdown.dropdownRef} className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
                                                {filteredCustomers.map(
                                                    (customer, index) => (
                                                        <button
                                                            key={customer.id}
                                                            type="button"
                                                            {...customerDropdown.getItemProps(index)}
                                                            onClick={() =>
                                                                handleSelectCustomerInternal(
                                                                    customer,
                                                                )
                                                            }
                                                            onMouseEnter={() => customerDropdown.setHighlightedIndex(index)}
                                                            className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-muted ${customerDropdown.getItemProps(index).className}`}
                                                        >
                                                            <div>
                                                                <p className="font-medium">
                                                                    {
                                                                        customer.name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        customer.phone
                                                                    }
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </div>
                                <InputError message={errors.customer_id} />
                            </div>

                            {/* Customer Info */}
                            <div className="rounded-xl border border-border bg-card p-4">
                                {selectedCustomer ? (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-foreground">
                                            {selectedCustomer.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedCustomer.address}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedCustomer.phone}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        Select a customer
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Search (normal mode) / Scrap Input (scrap mode) */}
                        {data.is_scrap_purchase ? (
                            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/10">
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Add Scrap Item
                                </label>
                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label className="mb-1 block text-xs text-muted-foreground">Description *</label>
                                        <input
                                            ref={scrapDescRef}
                                            type="text"
                                            placeholder="e.g., Iron scrap, Plastic waste..."
                                            value={scrapDescription}
                                            onChange={(e) => setScrapDescription(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddScrapItem();
                                                }
                                            }}
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        />
                                    </div>
                                    <div className="w-28">
                                        <label className="mb-1 block text-xs text-muted-foreground">Weight (kg)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            placeholder="0"
                                            value={scrapWeight}
                                            onChange={(e) => setScrapWeight(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddScrapItem();
                                                }
                                            }}
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        />
                                    </div>
                                    <div className="w-28">
                                        <label className="mb-1 block text-xs text-muted-foreground">Rate/kg</label>
                                        <input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            placeholder="0"
                                            value={scrapRate}
                                            onChange={(e) => setScrapRate(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddScrapItem();
                                                }
                                            }}
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddScrapItem}
                                        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-4 rounded-xl border border-border bg-card p-4">
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Add Products
                                </label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        ref={productSearchRef}
                                        type="text"
                                        placeholder="Search products... (↑↓ navigate, Enter select, Shift+Enter → discount)"
                                        value={productSearch}
                                        onChange={(e) => {
                                            setProductSearch(e.target.value);
                                            setShowProductDropdown(true);
                                        }}
                                        onFocus={() => setShowProductDropdown(true)}
                                        onKeyDown={handleProductSearchKeyDown}
                                        className="w-full rounded-lg border border-border bg-background py-2.5 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    {showProductDropdown &&
                                        filteredProducts.length > 0 && (
                                            <div ref={productDropdown.dropdownRef} className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
                                                {filteredProducts.map((product, index) => (
                                                    <button
                                                        key={product.id}
                                                        type="button"
                                                        {...productDropdown.getItemProps(index)}
                                                        onClick={() =>
                                                            handleAddProductInternal(
                                                                product,
                                                            )
                                                        }
                                                        onMouseEnter={() => productDropdown.setHighlightedIndex(index)}
                                                        className={`flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted ${productDropdown.getItemProps(index).className}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="rounded-lg bg-primary/10 p-2">
                                                                <Package className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-foreground">
                                                                    {product.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {product.size} •{' '}
                                                                    {product.pieces_per_bundle}{' '}
                                                                    pcs/bundle
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">
                                                                ৳{product.rate_per_kg}/kg
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}

                        {/* Items Table */}
                        <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
                            <table className="w-full">
                                <thead className="border-b border-border bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                                            {data.is_scrap_purchase ? 'Description' : 'Product'}
                                        </th>
                                        {!data.is_scrap_purchase && (
                                            <>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                                                    Bundles
                                                </th>
                                                {showExtraPieces && (
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                                                        Extra Pcs
                                                    </th>
                                                )}
                                                {!showExtraPieces && (
                                                    <th className="px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowExtraPieces(true)}
                                                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                            title="Show extra pieces column"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Pcs
                                                        </button>
                                                    </th>
                                                )}
                                                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                                                    Total Pcs
                                                </th>
                                            </>
                                        )}
                                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                                            Weight (kg)
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                                            Rate/kg
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {data.items.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={data.is_scrap_purchase ? 5 : 8}
                                                className="px-4 py-8 text-center text-sm text-muted-foreground"
                                            >
                                                <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                                {data.is_scrap_purchase ? 'No scrap items added yet' : 'No products added yet'}
                                            </td>
                                        </tr>
                                    ) : (
                                        data.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3">
                                                    {data.is_scrap_purchase ? (
                                                        <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) => updateScrapDescription(index, e.target.value)}
                                                            className="w-full rounded-lg border border-border bg-background px-2 py-1 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                                        />
                                                    ) : (
                                                        <div>
                                                            <p className="font-medium">
                                                                {item.product_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {item.product_size} • {item.pieces_per_bundle} pcs/bdl
                                                            </p>
                                                        </div>
                                                    )}
                                                </td>
                                                {!data.is_scrap_purchase && (
                                                    <>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                ref={(el) => { bundleInputRefs.current[index] = el; }}
                                                                type="number"
                                                                min={0}
                                                                value={item.bundles}
                                                                onChange={(e) =>
                                                                    updateItem(index, 'bundles', parseInt(e.target.value) || 0)
                                                                }
                                                                onKeyDown={(e) => handleBundleKeyDown(e, index)}
                                                                className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                                            />
                                                        </td>
                                                        {showExtraPieces && (
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={item.extra_pieces}
                                                                    onChange={(e) =>
                                                                        updateItem(index, 'extra_pieces', parseInt(e.target.value) || 0)
                                                                    }
                                                                    className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                                                />
                                                            </td>
                                                        )}
                                                        {!showExtraPieces && <td className="px-4 py-3" />}
                                                        <td className="px-4 py-3 text-center font-medium">
                                                            {item.total_pieces}
                                                        </td>
                                                    </>
                                                )}
                                                <td className="px-4 py-3">
                                                    <input
                                                        ref={(el) => { weightInputRefs.current[index] = el; }}
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={
                                                            item.weight_kg || ''
                                                        }
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                'weight_kg',
                                                                parseFloat(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            )
                                                        }
                                                        onKeyDown={(e) => handleWeightKeyDown(e, index)}
                                                        className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={item.rate_per_kg}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                'rate_per_kg',
                                                                parseFloat(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            )
                                                        }
                                                        className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-red-600">
                                                    {formatCurrency(
                                                        item.sub_total,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(index)
                                                        }
                                                        className="rounded-lg p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-xl border border-border bg-card p-4">
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Note
                                </label>
                                <textarea
                                    value={data.note}
                                    onChange={(e) =>
                                        setData('note', e.target.value)
                                    }
                                    rows={4}
                                    placeholder="Add any notes..."
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                />
                            </div>

                            <div className="rounded-xl border border-border bg-card p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Total Weight
                                        </span>
                                        <span className="flex items-center gap-1 font-medium">
                                            <Weight className="h-4 w-4" />
                                            {data.total_weight} kg
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Sub Total
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(data.sub_total)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Discount
                                        </span>
                                        <input
                                            ref={discountRef}
                                            type="number"
                                            min={0}
                                            value={data.discount || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'discount',
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="w-32 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                        />
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-semibold">
                                                Grand Total
                                            </span>
                                            <span className="text-xl font-bold text-red-600">
                                                {formatCurrency(
                                                    data.grand_total,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="mt-6 flex justify-end gap-3">
                            <Link
                                href={`/dashboard/sales-returns/${salesReturn.id}`}
                                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                                <RotateCcw className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Update Return'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
