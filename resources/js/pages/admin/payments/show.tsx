import PrintReceipt from '@/components/common/print-receipt';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    FileText,
    Printer,
    User,
    Wallet,
} from 'lucide-react';

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

type CreatedBy = {
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
    payment_type: PaymentType | null;
    created_by: CreatedBy | null;
    created_at: string;
};

type Props = {
    payment: Payment;
};

export default function PaymentShow({ payment }: Props) {
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
            <div className="invoice-print-area min-h-screen bg-background p-6 print:bg-white print:p-0">
                <div className="mx-auto max-w-2xl">
                    {/* Header - Hide on print */}
                    <div className="mb-6 flex items-center justify-between print:hidden">
                        <Link
                            href="/dashboard/payments"
                            className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">
                                Back to Payments
                            </span>
                        </Link>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
                        >
                            <Printer className="h-4 w-4" />
                            Print Receipt
                        </button>
                    </div>

                    {/* Payment Receipt Card */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm print:border-0 print:shadow-none">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 print:bg-emerald-500">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Wallet className="h-6 w-6 text-white" />
                                        <h1 className="text-2xl font-bold text-white">
                                            Payment Receipt
                                        </h1>
                                    </div>
                                    <p className="mt-1 text-emerald-100">
                                        {formatDate(payment.payment_date)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-white">
                                        {formatCurrency(payment.amount)}
                                    </p>
                                    <p className="text-xs tracking-wide text-emerald-100 uppercase">
                                        Amount Paid
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="border-b border-border px-6 py-4">
                            <div className="flex items-start gap-3">
                                <div className="hidden rounded-full bg-emerald-100 p-2 sm:flex">
                                    <User className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground">
                                        {payment.customer.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {payment.customer.address}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {payment.customer.phone}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="px-6 py-4">
                            <h3 className="mb-4 flex items-center gap-2 font-medium text-foreground">
                                <Banknote className="h-5 w-5" />
                                Payment Details
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Payment Date
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {formatDate(payment.payment_date)}
                                    </span>
                                </div>

                                {payment.payment_type && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Payment Method
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {payment.payment_type.name}
                                        </span>
                                    </div>
                                )}

                                {payment.payment_ref && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Reference
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {payment.payment_ref}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between border-t border-border pt-3">
                                    <span className="text-lg font-medium text-foreground">
                                        Amount
                                    </span>
                                    <span className="text-lg font-bold text-emerald-600">
                                        {formatCurrency(payment.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Linked Sale */}
                        {payment.sale && (
                            <div className="border-t border-border px-6 py-4">
                                <h3 className="mb-4 flex items-center gap-2 font-medium text-foreground">
                                    <FileText className="h-5 w-5" />
                                    Linked Invoice
                                </h3>

                                <Link
                                    href={`/dashboard/sales/${payment.sale.id}`}
                                    className="block rounded-lg border border-border p-4 transition hover:bg-muted"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {payment.sale.bill_no}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(
                                                    payment.sale.sale_date,
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-foreground">
                                                {formatCurrency(
                                                    payment.sale.net_amount,
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Due:{' '}
                                                {formatCurrency(
                                                    payment.sale.due_amount,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* Note */}
                        {payment.note && (
                            <div className="border-t border-border px-6 py-4">
                                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                                    Note
                                </h3>
                                <p className="text-foreground">
                                    {payment.note}
                                </p>
                            </div>
                        )}

                        {/* Footer - Current Balance */}
                        <div className="border-t border-border bg-muted/30 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Customer's Current Due
                                </span>
                                <span className="text-lg font-semibold text-red-600">
                                    {formatCurrency(payment.customer.total_due)}
                                </span>
                            </div>
                        </div>

                        {/* Meta Info */}
                        <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                                <span>
                                    Recorded by:{' '}
                                    {payment.created_by?.name || 'System'}
                                </span>
                                <span>
                                    Created:{' '}
                                    {new Date(
                                        payment.created_at,
                                    ).toLocaleString('en-BD')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions - Hide on print */}
                    <div className="mt-6 flex justify-center gap-3 print:hidden">
                        <Link
                            href={`/dashboard/payments/${payment.id}/edit`}
                            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                        >
                            Edit Payment
                        </Link>
                        <Link
                            href="/dashboard/payments/create"
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            Record Another
                        </Link>
                    </div>
                </div>
            </div>

            {/* Print Layout */}
            <PrintReceipt
                receiptType="payment"
                receiptDate={payment.payment_date}
                amount={payment.amount}
                customerName={payment.customer.name}
                customerPhone={payment.customer.phone}
                customerAddress={payment.customer.address}
                customerTotalDue={payment.customer.total_due}
                paymentMethod={payment.payment_type?.name}
                paymentRef={payment.payment_ref}
                linkedInvoice={payment.sale?.bill_no}
                note={payment.note}
                processedBy={payment.created_by?.name}
            />
        </AppLayout>
    );
}
