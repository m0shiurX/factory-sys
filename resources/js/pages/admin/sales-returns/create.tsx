import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    RotateCcw,
    Search,
    Trash2,
    User,
    Weight,
} from 'lucide-react';
import { FormEventHandler, useEffect, useMemo, useRef, useState } from 'react';
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

type ReturnItem = {
    product_id: number;
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

type Props = {
    return_no: string;
    sale: Sale | null;
    customers: Customer[];
    products: Product[];
    sales: Sale[];
};

export default function SalesReturnCreate({
    return_no,
    sale,
    customers,
    products,
    sales,
}: Props) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        sale?.customer ? (sale.customer as unknown as Customer) : null,
    );
    const [, setSelectedSale] = useState<Sale | null>(sale || null);
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [customerSearch, setCustomerSearch] = useState(
        sale?.customer?.name || '',
    );
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [saleSearch, setSaleSearch] = useState(sale?.bill_no || '');
    const [showSaleDropdown, setShowSaleDropdown] = useState(false);
    const productSearchRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<{
        return_no: string;
        customer_id: number | null;
        sale_id: number | null;
        return_date: string;
        total_weight: number;
        sub_total: number;
        discount: number;
        grand_total: number;
        note: string;
        items: ReturnItem[];
    }>({
        return_no: return_no,
        customer_id: sale?.customer_id || null,
        sale_id: sale?.id || null,
        return_date: new Date().toISOString().split('T')[0],
        total_weight: 0,
        sub_total: 0,
        discount: 0,
        grand_total: 0,
        note: '',
        items: [],
    });

    // Filtered products
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

    // Filtered customers
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

    // Filtered sales
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

    // Select customer
    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setData('customer_id', customer.id);
        setCustomerSearch(customer.name);
        setShowCustomerDropdown(false);
    };

    // Select sale
    const handleSelectSale = (selectedSaleItem: Sale) => {
        setSelectedSale(selectedSaleItem);
        setData('sale_id', selectedSaleItem.id);
        setSaleSearch(selectedSaleItem.bill_no);
        setShowSaleDropdown(false);

        // Auto-select customer from sale
        if (selectedSaleItem.customer) {
            const customer = customers.find(
                (c) => c.id === selectedSaleItem.customer_id,
            );
            if (customer) {
                handleSelectCustomer(customer);
            }
        }
    };

    // Add product
    const handleAddProduct = (product: Product) => {
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
        } else {
            const newItem: ReturnItem = {
                product_id: product.id,
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
        }

        setProductSearch('');
        setShowProductDropdown(false);
        productSearchRef.current?.focus();
    };

    // Update item
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

    // Remove item
    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    // Submit
    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.customer_id) {
            toast.error('Please select a customer');
            return;
        }

        if (data.items.length === 0) {
            toast.error('Please add at least one product');
            return;
        }

        const missingWeight = data.items.some((item) => item.weight_kg <= 0);
        if (missingWeight) {
            toast.error('Please enter weight for all items');
            return;
        }

        post('/dashboard/sales-returns', {
            onSuccess: () => {
                toast.success('Sales return recorded successfully');
            },
        });
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
                    <div className="mb-6 flex items-center gap-4">
                        <Link
                            href="/dashboard/sales-returns"
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                New Sales Return
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Record products returned by customer
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
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
                                            {data.return_no}
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

                            {/* Against Sale (Optional) */}
                            <div className="rounded-xl border border-border bg-card p-4">
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                                    Against Sale (Optional)
                                </label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
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
                                        className="w-full rounded-lg border border-border bg-background py-2 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    {showSaleDropdown &&
                                        filteredSales.length > 0 && (
                                            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
                                                {filteredSales.map((s) => (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectSale(s)
                                                        }
                                                        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-muted"
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
                                <InputError message={errors.sale_id} />
                            </div>

                            {/* Customer Select */}
                            <div className="rounded-xl border border-border bg-card p-4">
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                                    Customer *
                                </label>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
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
                                        className="w-full rounded-lg border border-border bg-background py-2 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    />
                                    {showCustomerDropdown &&
                                        filteredCustomers.length > 0 && (
                                            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
                                                {filteredCustomers.map(
                                                    (customer) => (
                                                        <button
                                                            key={customer.id}
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectCustomer(
                                                                    customer,
                                                                )
                                                            }
                                                            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-muted"
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

                        {/* Product Search */}
                        <div className="mb-4 rounded-xl border border-border bg-card p-4">
                            <label className="mb-2 block text-sm font-medium text-foreground">
                                Add Products
                            </label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    ref={productSearchRef}
                                    type="text"
                                    placeholder="Search products by name or size..."
                                    value={productSearch}
                                    onChange={(e) => {
                                        setProductSearch(e.target.value);
                                        setShowProductDropdown(true);
                                    }}
                                    onFocus={() => setShowProductDropdown(true)}
                                    className="w-full rounded-lg border border-border bg-background py-2.5 pr-4 pl-10 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                />
                                {showProductDropdown &&
                                    filteredProducts.length > 0 && (
                                        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
                                            {filteredProducts.map((product) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleAddProduct(
                                                            product,
                                                        )
                                                    }
                                                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted"
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
                                                                {
                                                                    product.pieces_per_bundle
                                                                }{' '}
                                                                pcs/bundle
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">
                                                            ৳
                                                            {
                                                                product.rate_per_kg
                                                            }
                                                            /kg
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Stock:{' '}
                                                            {
                                                                product.stock_pieces
                                                            }{' '}
                                                            pcs
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
                            <table className="w-full">
                                <thead className="border-b border-border bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                                            Bundles
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                                            Extra Pcs
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                                            Total Pcs
                                        </th>
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
                                                colSpan={8}
                                                className="px-4 py-8 text-center text-sm text-muted-foreground"
                                            >
                                                <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                                No products added yet
                                            </td>
                                        </tr>
                                    ) : (
                                        data.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium">
                                                            {item.product_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.product_size}{' '}
                                                            •{' '}
                                                            {
                                                                item.pieces_per_bundle
                                                            }{' '}
                                                            pcs/bdl
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={item.bundles}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                'bundles',
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            )
                                                        }
                                                        className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={
                                                            item.extra_pieces
                                                        }
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                'extra_pieces',
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            )
                                                        }
                                                        className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center font-medium">
                                                    {item.total_pieces}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
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

                        {/* Summary & Actions */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Note */}
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
                                    placeholder="Add any notes about this return..."
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                />
                            </div>

                            {/* Totals */}
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
                                href="/dashboard/sales-returns"
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
                                {processing ? 'Saving...' : 'Record Return'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
