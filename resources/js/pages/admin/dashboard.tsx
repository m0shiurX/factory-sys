import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index as customersIndex } from '@/routes/customers';
import {
    index as expensesIndex,
    show as expensesShow,
} from '@/routes/expenses';
import {
    index as paymentsIndex,
    show as paymentsShow,
} from '@/routes/payments';
import { index as productionsIndex } from '@/routes/productions';
import { index as salesIndex, show as salesShow } from '@/routes/sales';
import { index as stockIndex } from '@/routes/stock';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Box,
    Calendar,
    Coins,
    Factory,
    Receipt,
    Users,
    Wallet,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type SalesStats = {
    total_sales: number;
    today_sales: number;
    today_sales_amount: number;
    this_month_sales_amount: number;
};

type PaymentStats = {
    total_payments: number;
    today_payments: number;
    today_payment_amount: number;
    this_month_payment_amount: number;
};

type ExpenseStats = {
    total_expenses: number;
    today_expenses: number;
    today_expense_amount: number;
    this_month_expense_amount: number;
};

type ProductionStats = {
    total_productions: number;
    today_productions: number;
    today_quantity: number;
    this_month_quantity: number;
};

type StockSummary = {
    total_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
    total_stock_quantity: number;
};

type CustomerSummary = {
    total_customers: number;
    customers_with_dues: number;
    total_outstanding: number;
};

type RecentSale = {
    id: number;
    sale_date: string;
    total_amount: number;
    customer: { id: number; name: string } | null;
};

type RecentPayment = {
    id: number;
    payment_date: string;
    amount: number;
    customer: { id: number; name: string } | null;
};

type RecentExpense = {
    id: number;
    expense_date: string;
    amount: number;
    description: string | null;
    category: { id: number; name: string } | null;
};

type Props = {
    salesStats: SalesStats;
    paymentStats: PaymentStats;
    expenseStats: ExpenseStats;
    productionStats: ProductionStats;
    stockSummary: StockSummary;
    customerSummary: CustomerSummary;
    recentSales: RecentSale[];
    recentPayments: RecentPayment[];
    recentExpenses: RecentExpense[];
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-BD').format(value);
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-BD', {
        day: '2-digit',
        month: 'short',
    });
}

export default function Dashboard({
    salesStats,
    paymentStats,
    expenseStats,
    productionStats,
    stockSummary,
    customerSummary,
    recentSales,
    recentPayments,
    recentExpenses,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Today's Sales */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                                <Receipt className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Today
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold">
                                {formatCurrency(salesStats.today_sales_amount)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {salesStats.today_sales} sales today
                            </p>
                        </div>
                        <Link
                            href={salesIndex().url}
                            className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            View sales <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {/* Today's Payments */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Today
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold">
                                {formatCurrency(
                                    paymentStats.today_payment_amount,
                                )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {paymentStats.today_payments} payments today
                            </p>
                        </div>
                        <Link
                            href={paymentsIndex().url}
                            className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            View payments <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {/* Today's Expenses */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                                <Coins className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Today
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold">
                                {formatCurrency(
                                    expenseStats.today_expense_amount,
                                )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {expenseStats.today_expenses} expenses today
                            </p>
                        </div>
                        <Link
                            href={expensesIndex().url}
                            className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            View expenses <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {/* Today's Production */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                                <Factory className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Today
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold">
                                {formatNumber(productionStats.today_quantity)}{' '}
                                pcs
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {productionStats.today_productions} batches
                                today
                            </p>
                        </div>
                        <Link
                            href={productionsIndex().url}
                            className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            View production <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>

                {/* Monthly Summary & Stock Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* This Month Summary */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-semibold">This Month</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Sales
                                </span>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                    {formatCurrency(
                                        salesStats.this_month_sales_amount,
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Payments Received
                                </span>
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                    {formatCurrency(
                                        paymentStats.this_month_payment_amount,
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Expenses
                                </span>
                                <span className="font-medium text-red-600 dark:text-red-400">
                                    {formatCurrency(
                                        expenseStats.this_month_expense_amount,
                                    )}
                                </span>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                        Production
                                    </span>
                                    <span className="font-medium">
                                        {formatNumber(
                                            productionStats.this_month_quantity,
                                        )}{' '}
                                        pcs
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Overview */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="mb-4 flex items-center gap-2">
                            <Box className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-semibold">Stock Overview</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Total Products
                                </span>
                                <span className="font-medium">
                                    {stockSummary.total_products}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Total Stock
                                </span>
                                <span className="font-medium">
                                    {formatNumber(
                                        stockSummary.total_stock_quantity,
                                    )}{' '}
                                    pcs
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-yellow-600 dark:text-yellow-400">
                                    Low Stock
                                </span>
                                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                                    {stockSummary.low_stock_products}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-red-600 dark:text-red-400">
                                    Out of Stock
                                </span>
                                <span className="font-medium text-red-600 dark:text-red-400">
                                    {stockSummary.out_of_stock_products}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={stockIndex().url}
                            className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            View stock report <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {/* Customer Summary */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-semibold">Customers</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Total Customers
                                </span>
                                <span className="font-medium">
                                    {customerSummary.total_customers}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    With Dues
                                </span>
                                <span className="font-medium">
                                    {customerSummary.customers_with_dues}
                                </span>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-red-600 dark:text-red-400">
                                        Total Outstanding
                                    </span>
                                    <span className="font-bold text-red-600 dark:text-red-400">
                                        {formatCurrency(
                                            customerSummary.total_outstanding,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={customersIndex().url}
                            className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            View customers <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Recent Sales */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                        <div className="border-b px-6 py-4">
                            <h3 className="flex items-center gap-2 font-semibold">
                                <Receipt className="h-4 w-4" /> Recent Sales
                            </h3>
                        </div>
                        <div className="divide-y">
                            {recentSales.length > 0 ? (
                                recentSales.map((sale) => (
                                    <Link
                                        key={sale.id}
                                        href={salesShow(sale.id).url}
                                        className="flex items-center justify-between px-6 py-3 hover:bg-muted/50"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {sale.customer?.name ?? 'N/A'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(sale.sale_date)}
                                            </p>
                                        </div>
                                        <span className="text-green-600 dark:text-green-400">
                                            {formatCurrency(sale.total_amount)}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <p className="px-6 py-4 text-center text-sm text-muted-foreground">
                                    No sales yet
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                        <div className="border-b px-6 py-4">
                            <h3 className="flex items-center gap-2 font-semibold">
                                <Wallet className="h-4 w-4" /> Recent Payments
                            </h3>
                        </div>
                        <div className="divide-y">
                            {recentPayments.length > 0 ? (
                                recentPayments.map((payment) => (
                                    <Link
                                        key={payment.id}
                                        href={paymentsShow(payment.id).url}
                                        className="flex items-center justify-between px-6 py-3 hover:bg-muted/50"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {payment.customer?.name ??
                                                    'N/A'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(
                                                    payment.payment_date,
                                                )}
                                            </p>
                                        </div>
                                        <span className="text-blue-600 dark:text-blue-400">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <p className="px-6 py-4 text-center text-sm text-muted-foreground">
                                    No payments yet
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Recent Expenses */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                        <div className="border-b px-6 py-4">
                            <h3 className="flex items-center gap-2 font-semibold">
                                <Coins className="h-4 w-4" /> Recent Expenses
                            </h3>
                        </div>
                        <div className="divide-y">
                            {recentExpenses.length > 0 ? (
                                recentExpenses.map((expense) => (
                                    <Link
                                        key={expense.id}
                                        href={expensesShow(expense.id).url}
                                        className="flex items-center justify-between px-6 py-3 hover:bg-muted/50"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {expense.category?.name ??
                                                    'Uncategorized'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(
                                                    expense.expense_date,
                                                )}
                                            </p>
                                        </div>
                                        <span className="text-red-600 dark:text-red-400">
                                            {formatCurrency(expense.amount)}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <p className="px-6 py-4 text-center text-sm text-muted-foreground">
                                    No expenses yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
