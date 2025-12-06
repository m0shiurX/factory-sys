import InputError from '@/components/common/input-error';
import AppLayout from '@/layouts/app-layout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    FileText,
    Search,
    User,
    Wallet,
} from 'lucide-react';
import { FormEventHandler, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    total_due: number;
};

type Sale = {
    id: number;
    bill_no: string;
    sale_date: string;
    net_amount: number;
    paid_amount: number;
    due_amount: number;
};

type PaymentType = {
    id: number;
    name: string;
};

type Payment = {
    id: number;
    customer_id: number;
    sale_id: number | null;
    amount: number;
    payment_ref: string | null;
    payment_date: string;
    note: string | null;
    customer: Customer;
    sale: Sale | null;
};

type Props = {
    payment: Payment;
    customers: Customer[];
    sales: Sale[];
    payment_types: PaymentType[];
};

export default function PaymentEdit({
    payment,
    customers,
    sales,
    payment_types,
}: Props) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        payment.customer,
    );
    const [customerSearch, setCustomerSearch] = useState(payment.customer.name);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const customerSearchRef = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors } = useForm<{
        customer_id: number | null;
        sale_id: number | null;
        amount: number;
        payment_type_id: number | null;
        payment_ref: string;
        payment_date: string;
        note: string;
    }>({
        customer_id: payment.customer_id,
        sale_id: payment.sale_id,
        amount: payment.amount,
        payment_type_id: null, // Will be set from payment_type relation if needed
        payment_ref: payment.payment_ref || '',
        payment_date: payment.payment_date.split('T')[0],
        note: payment.note || '',
    });

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

    // Select customer and reload sales
    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setData((prev) => ({
            ...prev,
            customer_id: customer.id,
            sale_id: null,
        }));
        setCustomerSearch(customer.name);
        setShowCustomerDropdown(false);
    };

    // Select sale to link payment
    const handleSelectSale = (saleId: number | null) => {
        setData('sale_id', saleId);
    };

    // Handle form submit
    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.customer_id) {
            toast.error('Please select a customer');
            return;
        }

        if (data.amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        put(`/dashboard/payments/${payment.id}`, {
            onSuccess: () => {
                toast.success('Payment updated successfully');
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href="/dashboard/payments"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Payments
                        </Link>
                        <h1 className="mt-2 text-2xl font-semibold text-foreground">
                            Edit Payment
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Update payment details
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="rounded-xl border border-border bg-card">
                            {/* Customer Selection */}
                            <div className="border-b border-border p-6">
                                <h2 className="mb-4 flex items-center gap-2 font-medium text-foreground">
                                    <User className="h-5 w-5" />
                                    Customer
                                </h2>

                                {selectedCustomer ? (
                                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {selectedCustomer.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedCustomer.phone} • Due:{' '}
                                                <span className="font-medium text-red-600">
                                                    {formatCurrency(
                                                        selectedCustomer.total_due,
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedCustomer(null);
                                                setCustomerSearch('');
                                                setData('customer_id', null);
                                            }}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            ref={customerSearchRef}
                                            type="text"
                                            placeholder="Search customer by name or phone..."
                                            value={customerSearch}
                                            onChange={(e) => {
                                                setCustomerSearch(e.target.value);
                                                setShowCustomerDropdown(true);
                                            }}
                                            onFocus={() =>
                                                setShowCustomerDropdown(true)
                                            }
                                            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                        />
                                        {showCustomerDropdown &&
                                            filteredCustomers.length > 0 && (
                                                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
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
                                                                className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-foreground">
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
                                                                <span className="text-sm font-medium text-red-600">
                                                                    {formatCurrency(
                                                                        customer.total_due,
                                                                    )}
                                                                </span>
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                )}
                                <InputError message={errors.customer_id} />
                            </div>

                            {/* Link to Sale (Optional) */}
                            {selectedCustomer && sales.length > 0 && (
                                <div className="border-b border-border p-6">
                                    <h2 className="mb-4 flex items-center gap-2 font-medium text-foreground">
                                        <FileText className="h-5 w-5" />
                                        Link to Invoice (Optional)
                                    </h2>
                                    <p className="mb-3 text-sm text-muted-foreground">
                                        Select an invoice to apply this payment to,
                                        or leave blank for a general payment.
                                    </p>

                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => handleSelectSale(null)}
                                            className={`w-full rounded-lg border p-3 text-left transition ${data.sale_id === null
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-muted-foreground'
                                                }`}
                                        >
                                            <p className="font-medium text-foreground">
                                                General Payment
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Not linked to a specific invoice
                                            </p>
                                        </button>

                                        {sales.map((sale) => (
                                            <button
                                                key={sale.id}
                                                type="button"
                                                onClick={() =>
                                                    handleSelectSale(sale.id)
                                                }
                                                className={`w-full rounded-lg border p-3 text-left transition ${data.sale_id === sale.id
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-muted-foreground'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {sale.bill_no}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatDate(
                                                                sale.sale_date,
                                                            )}{' '}
                                                            • Total:{' '}
                                                            {formatCurrency(
                                                                sale.net_amount,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span className="font-medium text-red-600">
                                                        Due:{' '}
                                                        {formatCurrency(
                                                            sale.due_amount,
                                                        )}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Payment Details */}
                            <div className="p-6">
                                <h2 className="mb-4 flex items-center gap-2 font-medium text-foreground">
                                    <Wallet className="h-5 w-5" />
                                    Payment Details
                                </h2>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Amount */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Amount <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Banknote className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.amount || ''}
                                                onChange={(e) =>
                                                    setData(
                                                        'amount',
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <InputError message={errors.amount} />
                                    </div>

                                    {/* Payment Date */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Payment Date{' '}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.payment_date}
                                            onChange={(e) =>
                                                setData(
                                                    'payment_date',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                        />
                                        <InputError message={errors.payment_date} />
                                    </div>

                                    {/* Payment Type */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
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
                                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                        >
                                            <option value="">Select method</option>
                                            {payment_types.map((pt) => (
                                                <option key={pt.id} value={pt.id}>
                                                    {pt.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.payment_type_id} />
                                    </div>

                                    {/* Reference */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Reference / Transaction ID
                                        </label>
                                        <input
                                            type="text"
                                            value={data.payment_ref}
                                            onChange={(e) =>
                                                setData('payment_ref', e.target.value)
                                            }
                                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                            placeholder="e.g., TXN123456"
                                        />
                                        <InputError message={errors.payment_ref} />
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="mt-4">
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                                        Note
                                    </label>
                                    <textarea
                                        value={data.note}
                                        onChange={(e) =>
                                            setData('note', e.target.value)
                                        }
                                        rows={2}
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                        placeholder="Optional note..."
                                    />
                                    <InputError message={errors.note} />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 border-t border-border p-6">
                                <Link
                                    href="/dashboard/payments"
                                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Banknote className="h-4 w-4" />
                                    {processing ? 'Saving...' : 'Update Payment'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
