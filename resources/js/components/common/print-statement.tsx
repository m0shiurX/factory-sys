import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

type Transaction = {
    id: number;
    date: string;
    type: 'sale' | 'payment' | 'sales_return';
    description: string;
    reference: string | null;
    payment_info: string | null;
    debit: number;
    credit: number;
    balance: number;
};

type PrintStatementProps = {
    customerName: string;
    customerPhone: string | null;
    customerAddress: string | null;
    fromDate: string;
    toDate: string;
    openingBalance: number;
    closingBalance: number;
    totalDebit: number;
    totalCredit: number;
    transactions: Transaction[];
};

export default function PrintStatement({
    customerName,
    customerPhone,
    customerAddress,
    fromDate,
    toDate,
    openingBalance,
    closingBalance,
    totalDebit,
    totalCredit,
    transactions,
}: PrintStatementProps) {
    const { settings } = usePage<SharedData>().props;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
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

                {/* Statement Type Badge */}
                <div className="mb-4 flex justify-center">
                    <div className="border-2 border-black px-6 py-1">
                        <span className="text-sm font-semibold tracking-widest uppercase">
                            Account Statement
                        </span>
                    </div>
                </div>

                {/* Customer & Period Info */}
                <div className="mb-4 flex justify-between text-sm">
                    <div>
                        <p>
                            <span className="font-semibold">Customer:</span>{' '}
                            {customerName}
                        </p>
                        {customerPhone && (
                            <p>
                                <span className="font-semibold">Phone:</span>{' '}
                                {customerPhone}
                            </p>
                        )}
                        {customerAddress && (
                            <p>
                                <span className="font-semibold">Address:</span>{' '}
                                {customerAddress}
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <p>
                            <span className="font-semibold">Period:</span>{' '}
                            {formatDate(fromDate)} - {formatDate(toDate)}
                        </p>
                        <p>
                            <span className="font-semibold">Print Date:</span>{' '}
                            {formatDate(new Date().toISOString())}
                        </p>
                    </div>
                </div>

                {/* Opening Balance */}
                <div className="mb-2 border-y border-gray-300 bg-gray-50 px-2 py-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Opening Balance</span>
                        <span className={openingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(openingBalance)}
                        </span>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="mb-4">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-y-2 border-black bg-gray-100">
                                <th className="px-2 py-2 text-left text-xs font-semibold uppercase">
                                    Date
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-semibold uppercase">
                                    Description
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-semibold uppercase">
                                    Payment
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-semibold uppercase">
                                    Debit
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-semibold uppercase">
                                    Credit
                                </th>
                                <th className="px-2 py-2 text-right text-xs font-semibold uppercase">
                                    Balance
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-2 py-4 text-center text-gray-500">
                                        No transactions in this period
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((txn) => (
                                    <tr key={`${txn.type}-${txn.id}`} className="border-b border-gray-300">
                                        <td className="px-2 py-1.5 whitespace-nowrap">
                                            {formatDate(txn.date)}
                                        </td>
                                        <td className="px-2 py-1.5">
                                            {txn.description}
                                            {txn.reference && (
                                                <span className="ml-1 text-xs text-gray-500">
                                                    ({txn.reference})
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1.5 text-xs text-gray-500">
                                            {txn.payment_info || '—'}
                                        </td>
                                        <td className="px-2 py-1.5 text-right text-red-600">
                                            {txn.debit > 0 ? formatCurrency(txn.debit) : ''}
                                        </td>
                                        <td className="px-2 py-1.5 text-right text-green-600">
                                            {txn.credit > 0 ? formatCurrency(txn.credit) : ''}
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-medium">
                                            {formatCurrency(txn.balance)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-black bg-gray-100">
                                <td colSpan={3} className="px-2 py-2 font-semibold">
                                    Total
                                </td>
                                <td className="px-2 py-2 text-right font-semibold text-red-600">
                                    {formatCurrency(totalDebit)}
                                </td>
                                <td className="px-2 py-2 text-right font-semibold text-green-600">
                                    {formatCurrency(totalCredit)}
                                </td>
                                <td className="px-2 py-2"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Closing Balance */}
                <div className="mb-4 border-y-2 border-black bg-gray-100 px-2 py-2">
                    <div className="flex justify-between font-semibold">
                        <span>Closing Balance</span>
                        <span className={closingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(closingBalance)}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 text-center">
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
