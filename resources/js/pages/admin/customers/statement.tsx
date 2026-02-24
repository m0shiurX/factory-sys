import PrintStatement from '@/components/common/print-statement';
import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    FileText,
    Printer,
    RotateCcw,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    total_due: number;
};

type Transaction = {
    id: number;
    date: string;
    type: 'sale' | 'payment' | 'sales_return';
    description: string;
    reference: string | null;
    debit: number;
    credit: number;
};

type Statement = {
    from_date: string;
    to_date: string;
    opening_balance: number;
    transactions: Transaction[];
    total_debit: number;
    total_credit: number;
    closing_balance: number;
};

type Props = {
    customer: Customer;
    statement: Statement;
    filters: {
        from_date: string;
        to_date: string;
    };
};

export default function CustomerStatement({
    customer,
    statement,
    filters,
}: Props) {
    const [fromDate, setFromDate] = useState(filters.from_date);
    const [toDate, setToDate] = useState(filters.to_date);

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

    const handleFilter = () => {
        router.get(
            `/dashboard/customers/${customer.id}/statement`,
            { from_date: fromDate, to_date: toDate },
            { preserveState: true },
        );
    };

    const handlePrint = () => {
        window.print();
    };

    // Calculate running balance for each transaction
    let runningBalance = statement.opening_balance;
    const transactionsWithBalance = statement.transactions.map((txn) => {
        runningBalance = runningBalance + txn.debit - txn.credit;
        return { ...txn, balance: runningBalance };
    });

    return (
        <AppLayout>
            <div className="invoice-print-area min-h-screen bg-background p-6 print:bg-white print:p-0">
                <div className="mx-auto max-w-5xl">
                    {/* Header - Hide on print */}
                    <div className="mb-6 flex items-center justify-between print:hidden">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/dashboard/customers/${customer.id}`}
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-card hover:text-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    Customer Statement
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {customer.name}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                    </div>

                    {/* Date Filter - Hide on print */}
                    <div className="mb-6 rounded-xl border border-border bg-card p-4 print:hidden">
                        <div className="flex flex-wrap items-end gap-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) =>
                                        setFromDate(e.target.value)
                                    }
                                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={handleFilter}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>

                    {/* Statement Card */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card print:border-0">
                        {/* Statement Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 print:bg-blue-500">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-6 w-6 text-white" />
                                        <h2 className="text-xl font-bold text-white">
                                            Account Statement
                                        </h2>
                                    </div>
                                    <p className="mt-1 text-blue-100">
                                        {formatDate(statement.from_date)} -{' '}
                                        {formatDate(statement.to_date)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-blue-100">
                                        Customer
                                    </p>
                                    <p className="text-lg font-semibold text-white">
                                        {customer.name}
                                    </p>
                                    {customer.phone && (
                                        <p className="text-sm text-blue-100">
                                            {customer.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Opening Balance */}
                        <div className="border-b border-border bg-muted/30 px-6 py-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-foreground">
                                    Opening Balance (as of{' '}
                                    {formatDate(statement.from_date)})
                                </span>
                                <span
                                    className={`text-lg font-semibold ${statement.opening_balance > 0
                                        ? 'text-red-600'
                                        : statement.opening_balance < 0
                                            ? 'text-emerald-600'
                                            : 'text-foreground'
                                        }`}
                                >
                                    {formatCurrency(statement.opening_balance)}
                                </span>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                            Description
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                                            Debit
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                                            Credit
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                                            Balance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactionsWithBalance.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No transactions in this period
                                            </td>
                                        </tr>
                                    ) : (
                                        transactionsWithBalance.map(
                                            (txn, index) => (
                                                <tr
                                                    key={`${txn.type}-${txn.id}`}
                                                    className={`border-b border-border ${index % 2 === 0
                                                        ? 'bg-background'
                                                        : 'bg-muted/20'
                                                        }`}
                                                >
                                                    <td className="px-4 py-3 text-sm whitespace-nowrap text-foreground">
                                                        {formatDate(txn.date)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {txn.type === 'sale' ? (
                                                                <TrendingUp className="h-4 w-4 text-red-500" />
                                                            ) : txn.type === 'sales_return' ? (
                                                                <RotateCcw className="h-4 w-4 text-amber-500" />
                                                            ) : (
                                                                <TrendingDown className="h-4 w-4 text-emerald-500" />
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">
                                                                    {
                                                                        txn.description
                                                                    }
                                                                </p>
                                                                {txn.reference && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {
                                                                            txn.reference
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm whitespace-nowrap">
                                                        {txn.debit > 0 && (
                                                            <span className="text-red-600">
                                                                {formatCurrency(
                                                                    txn.debit,
                                                                )}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm whitespace-nowrap">
                                                        {txn.credit > 0 && (
                                                            <span className="text-emerald-600">
                                                                {formatCurrency(
                                                                    txn.credit,
                                                                )}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-medium whitespace-nowrap text-foreground">
                                                        {formatCurrency(
                                                            txn.balance,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-border bg-muted/50">
                                        <td
                                            colSpan={2}
                                            className="px-4 py-3 text-sm font-medium text-foreground"
                                        >
                                            Period Total
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                                            {statement.total_debit > 0
                                                ? formatCurrency(
                                                    statement.total_debit,
                                                )
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">
                                            {statement.total_credit > 0
                                                ? formatCurrency(
                                                    statement.total_credit,
                                                )
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Closing Balance */}
                        <div className="border-t border-border bg-muted/50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-lg font-semibold text-foreground">
                                        Closing Balance (as of{' '}
                                        {formatDate(statement.to_date)})
                                    </span>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Opening{' '}
                                        {formatCurrency(
                                            statement.opening_balance,
                                        )}{' '}
                                        + Debit{' '}
                                        {formatCurrency(statement.total_debit)}{' '}
                                        - Credit{' '}
                                        {formatCurrency(statement.total_credit)}
                                    </p>
                                </div>
                                <span
                                    className={`text-2xl font-bold ${statement.closing_balance > 0
                                        ? 'text-red-600'
                                        : statement.closing_balance < 0
                                            ? 'text-emerald-600'
                                            : 'text-foreground'
                                        }`}
                                >
                                    {formatCurrency(statement.closing_balance)}
                                </span>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 border-t border-border p-6 print:hidden">
                            <div className="rounded-lg bg-red-500/10 p-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-red-600" />
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Total Sales
                                    </span>
                                </div>
                                <p className="mt-2 text-xl font-semibold text-red-600">
                                    {formatCurrency(statement.total_debit)}
                                </p>
                            </div>
                            <div className="rounded-lg bg-emerald-500/10 p-4">
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-emerald-600" />
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Total Payments
                                    </span>
                                </div>
                                <p className="mt-2 text-xl font-semibold text-emerald-600">
                                    {formatCurrency(statement.total_credit)}
                                </p>
                            </div>
                            <div className="rounded-lg bg-muted p-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Transactions
                                    </span>
                                </div>
                                <p className="mt-2 text-xl font-semibold text-foreground">
                                    {statement.transactions.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions - Hide on print */}
                    <div className="mt-6 flex justify-center gap-3 print:hidden">
                        <Link
                            href={`/dashboard/payments/create?customer_id=${customer.id}`}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            Record Payment
                        </Link>
                        <Link
                            href={`/dashboard/customers/${customer.id}`}
                            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                        >
                            Back to Customer
                        </Link>
                    </div>
                </div>
            </div>

            {/* Print Layout */}
            <PrintStatement
                customerName={customer.name}
                customerPhone={customer.phone}
                customerAddress={customer.address}
                fromDate={statement.from_date}
                toDate={statement.to_date}
                openingBalance={statement.opening_balance}
                closingBalance={statement.closing_balance}
                totalDebit={statement.total_debit}
                totalCredit={statement.total_credit}
                transactions={transactionsWithBalance}
            />
        </AppLayout>
    );
}
