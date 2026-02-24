import PrintInvoice from '@/components/common/print-invoice';
import AppLayout from '@/layouts/app-layout';
import { numberToWords } from '@/utils/number-to-words';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Printer, Receipt, User } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    total_due: number;
};

type Product = {
    id: number;
    name: string;
    size: string | null;
    pieces_per_bundle: number;
};

type SalesItem = {
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

type PaymentType = {
    id: number;
    name: string;
};

type CreatedBy = {
    id: number;
    name: string;
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
    notes: string | null;
    payment_ref: string | null;
    customer: Customer;
    items: SalesItem[];
    payment_type: PaymentType | null;
    created_by: CreatedBy | null;
    created_at: string;
};

type Props = {
    sale: Sale;
    auto_print?: boolean;
};

export default function SaleShow({ sale, auto_print }: Props) {
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
            month: 'long',
            day: 'numeric',
        });
    };

    const handlePrint = () => {
        window.print();
    };

    // Auto print when redirected from create
    useEffect(() => {
        if (auto_print) {
            toast.success('Sale created successfully');
            // Small delay to ensure page is fully rendered
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [auto_print]);

    return (
        <AppLayout>
            <div className="invoice-print-area min-h-screen bg-background p-6 print:bg-white print:p-4">
                <div className="mx-auto max-w-4xl print:max-w-full">
                    {/* Header - Hide on print */}
                    <div className="mb-6 flex items-center justify-between print:hidden print:mb-0">
                        <Link
                            href="/dashboard/sales"
                            className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Sales</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/dashboard/sales/${sale.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
                            >
                                <Printer className="h-4 w-4" />
                                Print
                            </button>
                        </div>
                    </div>

                    {/* Invoice Card */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm print:border print:border-gray-300 print:shadow-none print:rounded-none">
                        {/* Invoice Header */}
                        <div className="bg-linear-to-r from-emerald-500 to-emerald-600 px-6 py-5 print:bg-emerald-500">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Receipt className="h-6 w-6 text-white" />
                                        <h1 className="text-2xl font-bold text-white">
                                            {sale.bill_no}
                                        </h1>
                                    </div>
                                    <p className="mt-1 text-emerald-100">
                                        {formatDate(sale.sale_date)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-white">
                                        {formatCurrency(sale.net_amount)}
                                    </p>
                                    <p className="text-xs tracking-wide text-emerald-100 uppercase">
                                        Grand Total
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="border-b border-border px-6 py-4">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row">
                                <div className="flex items-start gap-3">
                                    <div className="hidden rounded-full bg-emerald-100 p-2 sm:flex">
                                        <User className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground">
                                            {sale.customer.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {sale.customer.address}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {sale.customer.phone}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                        Total Due
                                    </p>
                                    <p
                                        className={`text-2xl font-bold ${sale.customer.total_due > 0
                                            ? 'text-red-600'
                                            : 'text-emerald-600'
                                            }`}
                                    >
                                        {formatCurrency(
                                            sale.customer.total_due,
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Overall balance
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="px-6 py-4">
                            <div className="overflow-hidden rounded-lg border border-border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/50">
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                #
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Product
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Qty
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Weight
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Rate
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {sale.items.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-foreground">
                                                        {item.product.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.product.size}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="font-medium text-foreground">
                                                        {item.bundles > 0 &&
                                                            `${item.bundles} bdl`}
                                                        {item.extra_pieces >
                                                            0 &&
                                                            ` + ${item.extra_pieces} pcs`}
                                                    </span>
                                                    <p className="text-xs text-muted-foreground">
                                                        ({item.total_pieces}{' '}
                                                        pcs)
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-foreground">
                                                    {item.weight_kg} kg
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                    {formatCurrency(
                                                        item.rate_per_kg,
                                                    )}
                                                    /kg
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-foreground">
                                                    {formatCurrency(
                                                        item.amount,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="border-t border-border bg-muted/30 px-6 py-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
                                {/* Notes & Payment Info */}
                                <div className="flex-1 space-y-3">
                                    {sale.notes && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                                Note
                                            </p>
                                            <p className="mt-1 text-sm text-foreground">
                                                {sale.notes}
                                            </p>
                                        </div>
                                    )}
                                    {(sale.payment_type || sale.payment_ref) && (
                                        <div className="rounded-lg border border-border bg-background p-3">
                                            <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase">
                                                Payment Details
                                            </p>
                                            {sale.payment_type && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-muted-foreground">Method:</span>
                                                    <span className="font-medium text-foreground">{sale.payment_type.name}</span>
                                                </div>
                                            )}
                                            {sale.payment_ref && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-muted-foreground">Reference:</span>
                                                    <span className="font-medium text-foreground">{sale.payment_ref}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Totals */}
                                <div className="w-full space-y-2 sm:w-72">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Total Weight
                                        </span>
                                        <span className="text-foreground">
                                            {sale.total_weight_kg} kg
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span className="text-foreground">
                                            {formatCurrency(sale.total_amount)}
                                        </span>
                                    </div>
                                    {sale.discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Discount
                                            </span>
                                            <span className="text-emerald-600">
                                                -{formatCurrency(sale.discount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-border pt-2">
                                        <span className="font-semibold text-foreground">
                                            Net Amount
                                        </span>
                                        <span className="text-lg font-bold text-foreground">
                                            {formatCurrency(sale.net_amount)}
                                        </span>
                                    </div>
                                    <div className="rounded-md bg-muted/50 px-2 py-1.5">
                                        <p className="text-xs italic text-muted-foreground">
                                            In Words: {numberToWords(sale.net_amount)} Taka Only
                                        </p>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Paid
                                        </span>
                                        <span className="font-medium text-emerald-600">
                                            {formatCurrency(sale.paid_amount)}
                                        </span>
                                    </div>
                                    {sale.due_amount > 0 && (
                                        <div className="flex justify-between border-t border-border pt-2">
                                            <span className="font-semibold text-red-600">
                                                Due
                                            </span>
                                            <span className="text-lg font-bold text-red-600">
                                                {formatCurrency(
                                                    sale.due_amount,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border px-6 py-3 text-center text-xs text-muted-foreground">
                            {sale.created_by && (
                                <p>Created by: {sale.created_by.name}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Layout - Hidden on screen, visible only when printing */}
            <PrintInvoice
                type="sale"
                invoiceNo={sale.bill_no}
                date={new Date(sale.sale_date).toLocaleDateString('en-BD', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                })}
                soldBy={sale.created_by?.name || 'Admin'}
                customerName={sale.customer.name}
                customerContact={sale.customer.phone}
                items={sale.items.map((item, index) => ({
                    sl: index + 1,
                    name: `${item.product.name}${item.product.size ? ` (${item.product.size})` : ''}`,
                    rate: item.rate_per_kg,
                    qty: `${item.weight_kg} KG`,
                    total: item.amount,
                }))}
                subTotal={sale.total_amount}
                discount={sale.discount}
                grandTotal={sale.net_amount}
                paidTotal={sale.paid_amount}
                dueAmount={sale.due_amount}
                customerTotalDue={sale.customer.total_due}
                totalWeight={sale.total_weight_kg}
                paymentMethod={sale.payment_type?.name}
                paymentRef={sale.payment_ref}
            />
        </AppLayout>
    );
}
