import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Printer, Receipt, User } from 'lucide-react';

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
    customer: Customer;
    items: SalesItem[];
    payment_type: PaymentType | null;
    created_by: CreatedBy | null;
    created_at: string;
};

type Props = {
    sale: Sale;
};

export default function SaleShow({ sale }: Props) {
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

    return (
        <AppLayout>
            <div className="min-h-screen bg-background p-6 print:bg-white print:p-0">
                <div className="mx-auto max-w-4xl">
                    {/* Header - Hide on print */}
                    <div className="mb-6 flex items-center justify-between print:hidden">
                        <Link
                            href="/dashboard/sales"
                            className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Sales</span>
                        </Link>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                    </div>

                    {/* Invoice Card */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm print:border-0 print:shadow-none">
                        {/* Invoice Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 print:bg-emerald-500">
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
                                    <p className="text-xs uppercase tracking-wide text-emerald-100">
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
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Total Due
                                    </p>
                                    <p
                                        className={`text-2xl font-bold ${sale.customer.total_due > 0
                                                ? 'text-red-600'
                                                : 'text-emerald-600'
                                            }`}
                                    >
                                        {formatCurrency(sale.customer.total_due)}
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
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                #
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                Product
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                Qty
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                Weight
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                Rate
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                                                        {item.extra_pieces > 0 &&
                                                            ` + ${item.extra_pieces} pcs`}
                                                    </span>
                                                    <p className="text-xs text-muted-foreground">
                                                        ({item.total_pieces} pcs)
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-foreground">
                                                    {item.weight_kg} kg
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                    {formatCurrency(item.rate_per_kg)}/kg
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-foreground">
                                                    {formatCurrency(item.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="border-t border-border bg-muted/30 px-6 py-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                                {/* Notes */}
                                {sale.notes && (
                                    <div className="flex-1">
                                        <p className="text-xs font-medium uppercase text-muted-foreground">
                                            Note
                                        </p>
                                        <p className="mt-1 text-sm text-foreground">
                                            {sale.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Totals */}
                                <div className="w-full space-y-2 sm:w-64">
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
                                                {formatCurrency(sale.due_amount)}
                                            </span>
                                        </div>
                                    )}
                                    {sale.payment_type && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Payment Method
                                            </span>
                                            <span className="text-foreground">
                                                {sale.payment_type.name}
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
        </AppLayout>
    );
}
