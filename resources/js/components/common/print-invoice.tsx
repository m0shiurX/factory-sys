import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

type InvoiceItem = {
    sl: number;
    name: string;
    rate: number;
    qty: string;
    total: number;
};

type PrintInvoiceProps = {
    type: 'sale' | 'return';
    invoiceNo: string;
    date: string;
    soldBy: string;
    customerName: string;
    customerContact: string | null;
    items: InvoiceItem[];
    subTotal: number;
    discount: number;
    grandTotal: number;
    paidTotal: number;
    dueAmount: number;
    customerTotalDue?: number;
    totalWeight?: number;
};

export default function PrintInvoice({
    type,
    invoiceNo,
    date,
    soldBy,
    customerName,
    customerContact,
    items,
    subTotal,
    discount,
    grandTotal,
    paidTotal,
    dueAmount,
    customerTotalDue,
    totalWeight,
}: PrintInvoiceProps) {
    const { name } = usePage<SharedData>().props;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div className="print-invoice-container hidden print:block">
            <div className="mx-auto max-w-[210mm] bg-white p-4 text-black">
                {/* Header */}
                <div className="mb-4 text-center">
                    <h1 className="text-2xl font-bold tracking-wide">
                        {name || 'Lavloss'}
                    </h1>
                    <p className="text-sm text-gray-600">
                        Uposhohor Main Road, Bogura Sadar
                    </p>
                    <p className="text-sm text-gray-600">+8801XXXXXXXXX</p>
                </div>

                {/* Invoice Type Badge */}
                <div className="mb-4 flex justify-center">
                    <div className="border-2 border-black px-6 py-1">
                        <span className="text-sm font-semibold tracking-widest uppercase">
                            {type === 'sale' ? 'Sales Memo' : 'Return Memo'}
                        </span>
                    </div>
                </div>

                {/* Invoice Info */}
                <div className="mb-4 flex justify-between text-sm">
                    <div>
                        <p>
                            <span className="font-semibold text-red-600">
                                {type === 'sale' ? 'Sale ID:' : 'Return ID:'}
                            </span>{' '}
                            {invoiceNo}
                        </p>
                        <p>
                            <span className="font-semibold text-red-600">
                                {type === 'sale' ? 'Sales Date:' : 'Return Date:'}
                            </span>{' '}
                            {date}
                        </p>
                        <p>
                            <span className="font-semibold text-red-600">
                                {type === 'sale' ? 'Sold By:' : 'Processed By:'}
                            </span>{' '}
                            {soldBy}
                        </p>
                        <div className="mt-2 inline-block border border-green-600 bg-green-50 px-2 py-0.5">
                            <span className="text-xs font-medium text-green-700">
                                Total Due: {formatCurrency(customerTotalDue ?? 0)} BDT
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p>
                            <span className="font-semibold">Name:</span>{' '}
                            {customerName}
                        </p>
                        <p className="text-gray-500">N/A</p>
                        <p>
                            <span className="font-semibold">Contact:</span>{' '}
                            {customerContact || '0000000000'}
                        </p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-4">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-y-2 border-black bg-gray-100">
                                <th className="px-2 py-2 text-left text-xs font-semibold uppercase">
                                    SL
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-semibold uppercase">
                                    Item Name
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-semibold uppercase">
                                    Rate
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-semibold uppercase">
                                    Qty
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-semibold uppercase">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr
                                    key={item.sl}
                                    className="border-b border-gray-300"
                                >
                                    <td className="px-2 py-2 text-sm">
                                        {item.sl}
                                    </td>
                                    <td className="px-2 py-2 text-sm">
                                        {item.name}
                                    </td>
                                    <td className="px-2 py-2 text-right text-sm">
                                        {formatCurrency(item.rate)}
                                    </td>
                                    <td className="px-2 py-2 text-right text-sm">
                                        {item.qty}
                                    </td>
                                    <td className="px-2 py-2 text-right text-sm">
                                        {formatCurrency(item.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Section */}
                <div className="mb-4 flex">
                    {/* In Words */}
                    <div className="flex-1">
                        <p className="text-xs font-semibold uppercase text-gray-600">
                            In Words:
                        </p>
                        <p className="text-xs uppercase text-gray-700">
                            {numberToWords(grandTotal)} Taka Only
                        </p>
                        {totalWeight && (
                            <p className="mt-2 text-xs text-gray-600">
                                Total Weight: {totalWeight} kg
                            </p>
                        )}
                    </div>

                    {/* Totals */}
                    <div className="w-64">
                        <div className="flex justify-between border-b border-gray-300 py-1 text-sm">
                            <span className="font-medium">SUB TOTAL</span>
                            <span>{formatCurrency(subTotal)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 py-1 text-sm">
                            <span className="font-medium">DISCOUNT</span>
                            <span>{formatCurrency(discount)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 py-1 text-sm font-semibold">
                            <span>GRAND TOTAL</span>
                            <span>{formatCurrency(grandTotal)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 py-1 text-sm">
                            <span className="font-medium">PAID TOTAL</span>
                            <span>{formatCurrency(paidTotal)}</span>
                        </div>
                        <div className="flex justify-between py-1 text-sm">
                            <span className="font-medium">INVOICE DUES</span>
                            <span>{formatCurrency(dueAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 text-center">
                    <p className="text-sm italic text-gray-500">
                        Thank you for your business!
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                        Developed by lavloss.com
                    </p>
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
