import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

type PrintReceiptProps = {
    receiptType: 'payment' | 'expense';
    receiptDate: string;
    amount: number;
    customerName: string;
    customerPhone: string | null;
    customerAddress: string | null;
    customerTotalDue?: number;
    paymentMethod?: string;
    paymentRef?: string | null;
    linkedInvoice?: string | null;
    note?: string | null;
    processedBy?: string;
};

export default function PrintReceipt({
    receiptType,
    receiptDate,
    amount,
    customerName,
    customerPhone,
    customerAddress,
    customerTotalDue,
    paymentMethod,
    paymentRef,
    linkedInvoice,
    note,
    processedBy,
}: PrintReceiptProps) {
    const { settings } = usePage<SharedData>().props;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-BD', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-BD', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="print-invoice-container hidden print:block">
            <div className="mx-auto max-w-[210mm] bg-white p-4 text-black">
                {/* Header */}
                <div className="mb-4 text-center">
                    <h1 className="text-2xl font-bold tracking-wide">
                        {settings?.company_name || 'Company Name'}
                    </h1>
                    <p className="text-sm text-gray-600">
                        {settings?.company_address || 'Company Address'}
                    </p>
                    <p className="text-sm text-gray-600">
                        {settings?.company_phone || 'Phone Number'}
                    </p>
                </div>

                {/* Receipt Type Badge */}
                <div className="mb-4 flex justify-center">
                    <div className="border-2 border-black px-6 py-1">
                        <span className="text-sm font-semibold tracking-widest uppercase">
                            {receiptType === 'payment' ? 'Payment Receipt' : 'Expense Receipt'}
                        </span>
                    </div>
                </div>

                {/* Receipt Info */}
                <div className="mb-4 flex justify-between text-sm">
                    <div>
                        <p>
                            <span className="font-semibold text-red-600">Date:</span>{' '}
                            {formatDate(receiptDate)}
                        </p>
                        {processedBy && (
                            <p>
                                <span className="font-semibold text-red-600">Received By:</span>{' '}
                                {processedBy}
                            </p>
                        )}
                        {customerTotalDue !== undefined && (
                            <div className="mt-2 inline-block border border-green-600 bg-green-50 px-2 py-0.5">
                                <span className="text-xs font-medium text-green-700">
                                    Total Due: {formatCurrency(customerTotalDue)} BDT
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <p>
                            <span className="font-semibold">Name:</span> {customerName}
                        </p>
                        {customerAddress && <p className="text-gray-500">{customerAddress}</p>}
                        <p>
                            <span className="font-semibold">Contact:</span>{' '}
                            {customerPhone || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Payment Details Table */}
                <div className="mb-4">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-y-2 border-black bg-gray-100">
                                <th className="px-2 py-2 text-left text-xs font-semibold uppercase">
                                    Description
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-semibold uppercase">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-300">
                                <td className="px-2 py-2 text-sm">
                                    <div>
                                        <p className="font-medium">
                                            {receiptType === 'payment'
                                                ? 'Payment Received'
                                                : 'Expense Payment'}
                                        </p>
                                        {paymentMethod && (
                                            <p className="text-xs text-gray-600">
                                                Method: {paymentMethod}
                                            </p>
                                        )}
                                        {paymentRef && (
                                            <p className="text-xs text-gray-600">
                                                Ref: {paymentRef}
                                            </p>
                                        )}
                                        {linkedInvoice && (
                                            <p className="text-xs text-gray-600">
                                                Invoice: {linkedInvoice}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-2 py-2 text-right text-lg font-semibold text-green-600">
                                    {formatCurrency(amount)}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-black">
                                <td className="px-2 py-2 text-right font-semibold">
                                    TOTAL RECEIVED
                                </td>
                                <td className="px-2 py-2 text-right text-lg font-bold">
                                    {formatCurrency(amount)} BDT
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Note */}
                {note && (
                    <div className="mb-4 rounded border border-gray-300 bg-gray-50 p-2">
                        <p className="text-xs font-semibold uppercase text-gray-600">Note:</p>
                        <p className="text-sm text-gray-700">{note}</p>
                    </div>
                )}

                {/* Amount in Words */}
                <div className="mb-4">
                    <p className="text-xs font-semibold uppercase text-gray-600">In Words:</p>
                    <p className="text-xs uppercase text-gray-700">
                        {numberToWords(amount)} Taka Only
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm italic text-gray-500">
                        {settings?.invoice_footer_message || 'Thank you for your business!'}
                    </p>
                    {settings?.invoice_developed_by && (
                        <p className="mt-2 text-xs text-gray-400">
                            {settings.invoice_developed_by}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper function to convert number to words
function numberToWords(num: number): string {
    const ones = [
        '',
        'One',
        'Two',
        'Three',
        'Four',
        'Five',
        'Six',
        'Seven',
        'Eight',
        'Nine',
        'Ten',
        'Eleven',
        'Twelve',
        'Thirteen',
        'Fourteen',
        'Fifteen',
        'Sixteen',
        'Seventeen',
        'Eighteen',
        'Nineteen',
    ];
    const tens = [
        '',
        '',
        'Twenty',
        'Thirty',
        'Forty',
        'Fifty',
        'Sixty',
        'Seventy',
        'Eighty',
        'Ninety',
    ];

    if (num === 0) return 'Zero';

    const numInt = Math.floor(num);

    if (numInt < 20) return ones[numInt];
    if (numInt < 100)
        return tens[Math.floor(numInt / 10)] + (numInt % 10 ? ' ' + ones[numInt % 10] : '');
    if (numInt < 1000)
        return (
            ones[Math.floor(numInt / 100)] +
            ' Hundred' +
            (numInt % 100 ? ' ' + numberToWords(numInt % 100) : '')
        );
    if (numInt < 100000)
        return (
            numberToWords(Math.floor(numInt / 1000)) +
            ' Thousand' +
            (numInt % 1000 ? ' ' + numberToWords(numInt % 1000) : '')
        );
    if (numInt < 10000000)
        return (
            numberToWords(Math.floor(numInt / 100000)) +
            ' Lakh' +
            (numInt % 100000 ? ' ' + numberToWords(numInt % 100000) : '')
        );

    return (
        numberToWords(Math.floor(numInt / 10000000)) +
        ' Crore' +
        (numInt % 10000000 ? ' ' + numberToWords(numInt % 10000000) : '')
    );
}
