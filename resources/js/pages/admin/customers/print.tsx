import { SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    total_due: number;
    credit_limit: number;
    is_active: boolean;
};

type Props = {
    customers: Customer[];
    totals: {
        total_due: number;
        count: number;
    };
    filters: {
        search?: string;
        active?: string;
        has_due?: string;
    };
};

export default function CustomersPrint({ customers, totals, filters }: Props) {
    const { settings } = usePage<SharedData>().props;

    useEffect(() => {
        const timer = setTimeout(() => window.print(), 500);
        return () => clearTimeout(timer);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const filterLabel = () => {
        if (filters.has_due === 'true') return 'Customers with Balance Due';
        if (filters.has_due === 'false') return 'Customers with No Due';
        return 'All Customers';
    };

    return (
        <>
            <Head title="Print Customer List" />
            <div className="print-invoice-container mx-auto max-w-[210mm] bg-white p-6 text-black">
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

                {/* Title Badge */}
                <div className="mb-4 flex justify-center">
                    <div className="border-2 border-black px-6 py-1">
                        <span className="text-sm font-semibold tracking-widest uppercase">
                            Customer List
                        </span>
                    </div>
                </div>

                {/* Filter Info & Print Date */}
                <div className="mb-4 flex justify-between text-sm">
                    <div>
                        <p>
                            <span className="font-semibold">Filter:</span>{' '}
                            {filterLabel()}
                        </p>
                        {filters.search && (
                            <p>
                                <span className="font-semibold">Search:</span>{' '}
                                {filters.search}
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <p>
                            <span className="font-semibold">Total:</span>{' '}
                            {totals.count} customers
                        </p>
                        <p>
                            <span className="font-semibold">Print Date:</span>{' '}
                            {new Date().toLocaleDateString('en-BD', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                {/* Customer Table */}
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-y-2 border-black bg-gray-100">
                            <th className="px-2 py-2 text-left text-xs font-semibold uppercase">
                                #
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-semibold uppercase">
                                Name
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-semibold uppercase">
                                Phone
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-semibold uppercase">
                                Address
                            </th>
                            <th className="px-2 py-2 text-right text-xs font-semibold uppercase">
                                Balance Due
                            </th>
                            <th className="px-2 py-2 text-right text-xs font-semibold uppercase">
                                Credit Limit
                            </th>
                            <th className="px-2 py-2 text-center text-xs font-semibold uppercase">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer, index) => (
                            <tr
                                key={customer.id}
                                className="border-b border-gray-300"
                            >
                                <td className="px-2 py-1.5 text-gray-500">
                                    {index + 1}
                                </td>
                                <td className="px-2 py-1.5 font-medium">
                                    {customer.name}
                                </td>
                                <td className="px-2 py-1.5">
                                    {customer.phone || '—'}
                                </td>
                                <td className="px-2 py-1.5 text-xs">
                                    {customer.address || '—'}
                                </td>
                                <td
                                    className={`px-2 py-1.5 text-right font-medium ${customer.total_due > 0
                                        ? 'text-red-600'
                                        : ''
                                        }`}
                                >
                                    {formatCurrency(customer.total_due)}
                                </td>
                                <td className="px-2 py-1.5 text-right text-gray-500">
                                    {customer.credit_limit > 0
                                        ? formatCurrency(customer.credit_limit)
                                        : '—'}
                                </td>
                                <td className="px-2 py-1.5 text-center text-xs">
                                    {customer.is_active
                                        ? 'Active'
                                        : 'Inactive'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-black bg-gray-100">
                            <td
                                colSpan={4}
                                className="px-2 py-2 font-semibold"
                            >
                                Total ({totals.count} customers)
                            </td>
                            <td className="px-2 py-2 text-right font-semibold text-red-600">
                                {formatCurrency(totals.total_due)}
                            </td>
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm italic text-gray-500">
                        {settings?.invoice_footer_message ||
                            'Thank you for your business!'}
                    </p>
                    {settings?.invoice_developed_by && (
                        <p className="mt-2 text-xs text-gray-400">
                            {settings.invoice_developed_by}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
