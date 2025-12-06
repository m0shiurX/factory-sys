import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Search, Trash2, User } from 'lucide-react';
import { FormEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    total_due: number;
    credit_limit: number;
};

type Product = {
    id: number;
    name: string;
    size: string | null;
    pieces_per_bundle: number;
    rate_per_kg: number;
    stock_pieces: number;
};

type PaymentType = {
    id: number;
    name: string;
};

type SaleItem = {
    product_id: number;
    product_name: string;
    product_size: string | null;
    pieces_per_bundle: number;
    bundles: number;
    extra_pieces: number;
    total_pieces: number;
    weight_kg: number;
    rate_per_kg: number;
    amount: number;
    stock: number;
};

type ExistingSalesItem = {
    id: number;
    product_id: number;
    bundles: number;
    extra_pieces: number;
    total_pieces: number;
    weight_kg: number;
    rate_per_kg: number;
    amount: number;
    product: Product;
};

type Sale = {
    id: number;
    bill_no: string;
    sale_date: string;
    total_pieces: number;
    total_weight_kg: number;
    total_amount: number;
    discount: number;
    net_amount: number;
    paid_amount: number;
    due_amount: number;
    payment_type_id: number | null;
    notes: string | null;
    customer: Customer;
    items: ExistingSalesItem[];
};

type Props = {
    sale: Sale;
    customers: Customer[];
    products: Product[];
    payment_types: PaymentType[];
};

export default function SaleEdit({
    sale,
    customers,
    products,
    payment_types,
}: Props) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        sale.customer,
    );
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [customerSearch, setCustomerSearch] = useState(sale.customer.name);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const productSearchRef = useRef<HTMLInputElement>(null);

    // Convert existing items to the form format
    const initialItems: SaleItem[] = sale.items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product.name,
        product_size: item.product.size,
        pieces_per_bundle: item.product.pieces_per_bundle,
        bundles: item.bundles,
        extra_pieces: item.extra_pieces,
        total_pieces: item.total_pieces,
        weight_kg: Number(item.weight_kg),
        rate_per_kg: Number(item.rate_per_kg),
        amount: Number(item.amount),
        stock: item.product.stock_pieces + item.total_pieces, // Add back the pieces since we're editing
    }));

    const { data, setData, put, processing, errors } = useForm<{
        customer_id: number | null;
        sale_date: string;
        total_pieces: number;
        total_weight_kg: number;
        total_amount: number;
        discount: number;
        net_amount: number;
        paid_amount: number;
        due_amount: number;
        payment_type_id: number | null;
        notes: string;
        items: SaleItem[];
    }>({
        customer_id: sale.customer.id,
        sale_date: sale.sale_date.split('T')[0],
        total_pieces: sale.total_pieces,
        total_weight_kg: Number(sale.total_weight_kg),
        total_amount: Number(sale.total_amount),
        discount: Number(sale.discount),
        net_amount: Number(sale.net_amount),
        paid_amount: Number(sale.paid_amount),
        due_amount: Number(sale.due_amount),
        payment_type_id: sale.payment_type_id,
        notes: sale.notes || '',
        items: initialItems,
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

    // Filtered customers based on search
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

    // Calculate totals when items change
    useEffect(() => {
        const totalPieces = data.items.reduce((sum, item) => sum + item.total_pieces, 0);
        const totalWeight = data.items.reduce(
            (sum, item) => sum + Number(item.weight_kg),
            0,
        );
        const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);
        const netAmount = totalAmount - (data.discount || 0);
        const dueAmount = netAmount - (data.paid_amount || 0);

        setData((prev) => ({
            ...prev,
            total_pieces: totalPieces,
            total_weight_kg: Number(totalWeight.toFixed(2)),
            total_amount: Number(totalAmount.toFixed(2)),
            net_amount: Number(netAmount.toFixed(2)),
            due_amount: Number(dueAmount.toFixed(2)),
        }));
    }, [data.items, data.discount, data.paid_amount]);

    // Select customer
    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setData('customer_id', customer.id);
        setCustomerSearch(customer.name);
        setShowCustomerDropdown(false);
    };

    // Add product to invoice
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
            const newItem: SaleItem = {
                product_id: product.id,
                product_name: product.name,
                product_size: product.size,
                pieces_per_bundle: product.pieces_per_bundle,
                bundles: 1,
                extra_pieces: 0,
                total_pieces: product.pieces_per_bundle,
                weight_kg: 0,
                rate_per_kg: product.rate_per_kg,
                amount: 0,
                stock: product.stock_pieces,
            };
            setData('items', [...data.items, newItem]);
        }

        setProductSearch('');
        setShowProductDropdown(false);
        productSearchRef.current?.focus();
    };

    // Update item field
    const updateItem = (index: number, field: keyof SaleItem, value: number) => {
        const newItems = [...data.items];
        const item = newItems[index];

        if (field === 'bundles' || field === 'extra_pieces') {
            (item as SaleItem)[field] = value;
            item.total_pieces =
                item.bundles * item.pieces_per_bundle + item.extra_pieces;
        } else if (field === 'weight_kg') {
            item.weight_kg = value;
            item.amount = Number((value * item.rate_per_kg).toFixed(2));
        } else if (field === 'rate_per_kg') {
            item.rate_per_kg = value;
            item.amount = Number((item.weight_kg * value).toFixed(2));
        }

        setData('items', newItems);
    };

    // Remove item
    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    // Handle form submit
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

        put(`/dashboard/sales/${sale.id}`, {
            onSuccess: () => {
                toast.success('Sale updated successfully');
            },
        });
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Format stock display
    const formatStock = (pieces: number, piecesPerBundle: number) => {
        const bundles = Math.floor(pieces / piecesPerBundle);
        const remaining = pieces % piecesPerBundle;
        if (remaining > 0) {
            return `${bundles} bdl + ${remaining} pcs`;
        }
        return `${bundles} bdl`;
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Link
                            href="/dashboard/sales"
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Edit Sale
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {sale.bill_no}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Invoice Header */}
                        <div className="mb-6 grid gap-4 md:grid-cols-3">
                            {/* Bill No & Date */}
                            <div className="rounded-xl border border-border bg-card p-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                            Bill No
                                        </label>
                                        <p className="text-lg font-semibold text-foreground">
                                            {sale.bill_no}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.sale_date}
                                            onChange={(e) =>
                                                setData('sale_date', e.target.value)
                                            }
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                        />
                                        <InputError message={errors.sale_date} />
                                    </div>
                                </div>
                            </div>

                            {/* Customer Select */}
                            <div className="rounded-xl border border-border bg-card p-4">
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                                    Customer *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                        onFocus={() => setShowCustomerDropdown(true)}
                                        className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    {showCustomerDropdown &&
                                        filteredCustomers.length > 0 && (
                                            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
                                                {filteredCustomers.map((customer) => (
                                                    <button
                                                        key={customer.id}
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectCustomer(customer)
                                                        }
                                                        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-muted"
                                                    >
                                                        <div>
                                                            <p className="font-medium">
                                                                {customer.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {customer.phone}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            Due:{' '}
                                                            {formatCurrency(
                                                                customer.total_due,
                                                            )}
                                                        </span>
                                                    </button>
                                                ))}
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
                                        <div className="pt-2">
                                            <span className="text-xs text-muted-foreground">
                                                Current Due:
                                            </span>
                                            <p className="text-xl font-bold text-red-600">
                                                {formatCurrency(
                                                    selectedCustomer.total_due,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        <p className="text-sm">
                                            Select a customer to see details
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    ref={productSearchRef}
                                    type="text"
                                    placeholder="Search and add products..."
                                    value={productSearch}
                                    onChange={(e) => {
                                        setProductSearch(e.target.value);
                                        setShowProductDropdown(true);
                                    }}
                                    onFocus={() => setShowProductDropdown(true)}
                                    className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                {showProductDropdown &&
                                    filteredProducts.length > 0 && (
                                        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
                                            {filteredProducts.map((product) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleAddProduct(product)
                                                    }
                                                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Package className="h-5 w-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">
                                                                {product.name}{' '}
                                                                {product.size && (
                                                                    <span className="text-muted-foreground">
                                                                        ({product.size})
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatCurrency(
                                                                    product.rate_per_kg,
                                                                )}
                                                                /kg •{' '}
                                                                {product.pieces_per_bundle}{' '}
                                                                pcs/bundle
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        Stock:{' '}
                                                        {formatStock(
                                                            product.stock_pieces,
                                                            product.pieces_per_bundle,
                                                        )}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                            </div>
                            <InputError message={errors.items} />
                        </div>

                        {/* Items Table */}
                        <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                            #
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">
                                            Bundles
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">
                                            +Pcs
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">
                                            Weight (kg)
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">
                                            Rate/kg
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">
                                            <Trash2 className="mx-auto h-4 w-4" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {data.items.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No products added.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.items.map((item, index) => (
                                            <tr
                                                key={item.product_id}
                                                className="hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-foreground">
                                                        {item.product_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.product_size} •{' '}
                                                        {item.total_pieces} pcs
                                                    </p>
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
                                                                parseInt(e.target.value) ||
                                                                0,
                                                            )
                                                        }
                                                        className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-center text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={item.extra_pieces}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                'extra_pieces',
                                                                parseInt(e.target.value) ||
                                                                0,
                                                            )
                                                        }
                                                        className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-center text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={0.01}
                                                        value={item.weight_kg || ''}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                'weight_kg',
                                                                parseFloat(
                                                                    e.target.value,
                                                                ) || 0,
                                                            )
                                                        }
                                                        placeholder="0.00"
                                                        className="w-24 rounded-lg border border-amber-400 bg-amber-50 px-2 py-1.5 text-center text-sm font-medium focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:bg-amber-950/30"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={0.01}
                                                        value={item.rate_per_kg}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                'rate_per_kg',
                                                                parseFloat(
                                                                    e.target.value,
                                                                ) || 0,
                                                            )
                                                        }
                                                        className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-center text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-foreground">
                                                    {formatCurrency(item.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
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

                        {/* Footer - Totals & Actions */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Notes & Payment */}
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Notes
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        placeholder="Additional notes..."
                                        className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                </div>
                                {data.paid_amount > 0 && (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            Payment Method
                                        </label>
                                        <select
                                            value={data.payment_type_id || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'payment_type_id',
                                                    e.target.value
                                                        ? parseInt(e.target.value)
                                                        : null,
                                                )
                                            }
                                            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                        >
                                            <option value="">Select payment method</option>
                                            {payment_types.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="rounded-xl border border-border bg-card p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Total Pieces
                                        </span>
                                        <span className="font-medium">
                                            {data.total_pieces} pcs
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Total Weight
                                        </span>
                                        <span className="font-medium">
                                            {data.total_weight_kg} kg
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Sub Total
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(data.total_amount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Discount
                                        </span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={data.discount || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'discount',
                                                    parseFloat(e.target.value) || 0,
                                                )
                                            }
                                            placeholder="0"
                                            className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border pt-3">
                                        <span className="font-semibold text-foreground">
                                            Net Amount
                                        </span>
                                        <span className="text-xl font-bold text-foreground">
                                            {formatCurrency(data.net_amount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Paid Amount
                                        </span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={data.paid_amount || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'paid_amount',
                                                    parseFloat(e.target.value) || 0,
                                                )
                                            }
                                            placeholder="0"
                                            className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border pt-3">
                                        <span className="font-semibold text-red-600">
                                            Due Amount
                                        </span>
                                        <span className="text-xl font-bold text-red-600">
                                            {formatCurrency(data.due_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center justify-end gap-4">
                            <Link
                                href="/dashboard/sales"
                                className="rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || data.items.length === 0}
                                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Update Invoice'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Click outside to close dropdowns */}
            {(showProductDropdown || showCustomerDropdown) && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                        setShowProductDropdown(false);
                        setShowCustomerDropdown(false);
                    }}
                />
            )}
        </AppLayout>
    );
}
