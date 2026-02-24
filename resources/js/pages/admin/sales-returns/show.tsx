import PrintInvoice from '@/components/common/print-invoice';
import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Printer,
    RotateCcw,
    ShoppingBag,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect } from 'react';
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
};

type Product = {
    id: number;
    name: string;
    size: string | null;
    pieces_per_bundle: number;
};

type SalesReturnItem = {
    id: number;
    product_id: number | null;
    description?: string;
    bundles: number;
    extra_pieces: number;
    total_pieces: number;
    weight_kg: number;
    rate_per_kg: number;
    sub_total: number;
    product: Product | null;
};

type CreatedBy = {
    id: number;
    name: string;
};

type SalesReturn = {
    id: number;
    return_no: string;
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
    created_by: CreatedBy | null;
    created_at: string;
};

type Props = {
    salesReturn: SalesReturn;
    auto_print?: boolean;
};

export default function SalesReturnShow({ salesReturn, auto_print }: Props) {
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

    const handleDelete = () => {
        if (
            confirm(
                'Are you sure you want to delete this return? This will reverse stock and customer due adjustments.',
            )
        ) {
            router.delete(`/dashboard/sales-returns/${salesReturn.id}`);
        }
    };

    // Auto print when redirected from create
    useEffect(() => {
        if (auto_print) {
            toast.success('Sales return recorded successfully');
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
                    <div className="mb-6 flex items-center justify-between print:hidden">
                        <Link
                            href="/dashboard/sales-returns"
                            className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Returns</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/dashboard/sales-returns/${salesReturn.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
                            >
                                <Printer className="h-4 w-4" />
                                Print
                            </button>
                        </div>
                    </div>

                    {/* Return Card */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm print:border-0 print:shadow-none">
                        {/* Return Header */}
                        <div className="bg-linear-to-r from-red-500 to-red-600 px-6 py-5 print:bg-red-500">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        {salesReturn.is_scrap_purchase ? (
                                            <ShoppingBag className="h-6 w-6 text-white" />
                                        ) : (
                                            <RotateCcw className="h-6 w-6 text-white" />
                                        )}
                                        <h1 className="text-2xl font-bold text-white">
                                            {salesReturn.return_no}
                                        </h1>
                                        {salesReturn.is_scrap_purchase && (
                                            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium text-white">
                                                Scrap Purchase
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-red-100">
                                        {formatDate(salesReturn.return_date)}
                                    </p>
                                    {salesReturn.sale && (
                                        <p className="mt-1 text-sm text-red-100">
                                            Against Sale:{' '}
                                            {salesReturn.sale.bill_no}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-white">
                                        -
                                        {formatCurrency(
                                            salesReturn.grand_total,
                                        )}
                                    </p>
                                    <p className="text-xs tracking-wide text-red-100 uppercase">
                                        Return Total
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="border-b border-border px-6 py-4">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row">
                                <div className="flex items-start gap-3">
                                    <div className="hidden rounded-full bg-red-100 p-2 sm:flex dark:bg-red-900/30">
                                        <User className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground">
                                            {salesReturn.customer.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {salesReturn.customer.address}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {salesReturn.customer.phone}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">
                                        Total Weight
                                    </p>
                                    <p className="text-lg font-semibold text-foreground">
                                        {salesReturn.total_weight} kg
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="px-6 py-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border text-left">
                                        <th className="pb-3 text-sm font-medium text-muted-foreground">
                                            {salesReturn.is_scrap_purchase ? 'Description' : 'Product'}
                                        </th>
                                        {!salesReturn.is_scrap_purchase && (
                                            <th className="pb-3 text-center text-sm font-medium text-muted-foreground">
                                                Qty
                                            </th>
                                        )}
                                        <th className="pb-3 text-center text-sm font-medium text-muted-foreground">
                                            Weight
                                        </th>
                                        <th className="pb-3 text-center text-sm font-medium text-muted-foreground">
                                            Rate/kg
                                        </th>
                                        <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {salesReturn.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-3">
                                                {salesReturn.is_scrap_purchase ? (
                                                    <p className="font-medium text-foreground">
                                                        {item.description || 'Scrap item'}
                                                    </p>
                                                ) : (
                                                    <>
                                                        <p className="font-medium text-foreground">
                                                            {item.product?.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.product?.size} •{' '}
                                                            {item.product?.pieces_per_bundle}{' '}
                                                            pcs/bdl
                                                        </p>
                                                    </>
                                                )}
                                            </td>
                                            {!salesReturn.is_scrap_purchase && (
                                                <td className="py-3 text-center">
                                                    <p className="font-medium text-foreground">
                                                        {item.bundles > 0 && (
                                                            <span>
                                                                {item.bundles} bdl
                                                            </span>
                                                        )}
                                                        {item.bundles > 0 &&
                                                            item.extra_pieces >
                                                            0 && (
                                                                <span> + </span>
                                                            )}
                                                        {item.extra_pieces > 0 && (
                                                            <span>
                                                                {item.extra_pieces}{' '}
                                                                pcs
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.total_pieces} pcs
                                                    </p>
                                                </td>
                                            )}
                                            <td className="py-3 text-center text-foreground">
                                                {item.weight_kg} kg
                                            </td>
                                            <td className="py-3 text-center text-foreground">
                                                ৳{item.rate_per_kg}
                                            </td>
                                            <td className="py-3 text-right font-medium text-red-600">
                                                {formatCurrency(item.sub_total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="border-t border-border bg-muted/30 px-6 py-4">
                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Sub Total
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(
                                                salesReturn.sub_total,
                                            )}
                                        </span>
                                    </div>
                                    {salesReturn.discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Discount
                                            </span>
                                            <span className="font-medium text-foreground">
                                                -
                                                {formatCurrency(
                                                    salesReturn.discount,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                                        <span>Grand Total</span>
                                        <span className="text-red-600">
                                            -
                                            {formatCurrency(
                                                salesReturn.grand_total,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes & Footer */}
                        {salesReturn.note && (
                            <div className="border-t border-border px-6 py-4">
                                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                    Notes
                                </h4>
                                <p className="text-sm text-foreground">
                                    {salesReturn.note}
                                </p>
                            </div>
                        )}

                        <div className="border-t border-border bg-muted/30 px-6 py-3 text-center text-xs text-muted-foreground">
                            <p>
                                Created by{' '}
                                {salesReturn.created_by?.name || 'System'} on{' '}
                                {formatDate(salesReturn.created_at)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Layout - Hidden on screen, visible only when printing */}
            <PrintInvoice
                type="return"
                invoiceNo={salesReturn.return_no}
                date={new Date(salesReturn.return_date).toLocaleDateString('en-BD', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                })}
                soldBy={salesReturn.created_by?.name || 'Admin'}
                customerName={salesReturn.customer.name}
                customerContact={salesReturn.customer.phone}
                items={salesReturn.items.map((item, index) => ({
                    sl: index + 1,
                    name: salesReturn.is_scrap_purchase
                        ? (item.description || 'Scrap item')
                        : `${item.product?.name || ''}${item.product?.size ? ` (${item.product.size})` : ''}`,
                    rate: item.rate_per_kg,
                    qty: `${item.weight_kg} KG`,
                    total: item.sub_total,
                }))}
                subTotal={salesReturn.sub_total}
                discount={salesReturn.discount}
                grandTotal={salesReturn.grand_total}
                paidTotal={0}
                dueAmount={salesReturn.grand_total}
                customerTotalDue={salesReturn.customer.total_due}
                totalWeight={salesReturn.total_weight}
            />
        </AppLayout>
    );
}
