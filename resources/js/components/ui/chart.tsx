import * as React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { cn } from '@/lib/utils';

// Chart container component
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function ChartContainer({
    children,
    className,
    ...props
}: ChartContainerProps) {
    return (
        <div className={cn('h-[300px] w-full', className)} {...props}>
            <ResponsiveContainer width="100%" height="100%">
                {children as React.ReactElement}
            </ResponsiveContainer>
        </div>
    );
}

// Sales vs Payments Bar Chart
interface WeeklyChartData {
    date: string;
    day: string;
    sales: number;
    payments: number;
}

interface SalesPaymentsChartProps {
    data: WeeklyChartData[];
    formatCurrency: (value: number) => string;
}

export function SalesPaymentsChart({
    data,
    formatCurrency,
}: SalesPaymentsChartProps) {
    return (
        <ChartContainer>
            <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted"
                />
                <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                />
                <YAxis
                    tickFormatter={(value) =>
                        value >= 1000 ? `${value / 1000}k` : value
                    }
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                />
                <Tooltip
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border bg-background p-3 shadow-md">
                                    <p className="mb-2 text-sm font-medium">
                                        {label}
                                    </p>
                                    {payload.map((entry, index) => (
                                        <p
                                            key={index}
                                            className="text-sm"
                                            style={{ color: entry.color }}
                                        >
                                            {entry.name}:{' '}
                                            {formatCurrency(
                                                entry.value as number,
                                            )}
                                        </p>
                                    ))}
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: 16 }}
                />
                <Bar
                    dataKey="sales"
                    name="Sales"
                    fill="hsl(142 76% 36%)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                />
                <Bar
                    dataKey="payments"
                    name="Payments"
                    fill="hsl(221 83% 53%)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                />
            </BarChart>
        </ChartContainer>
    );
}

// Expense Breakdown Pie Chart
interface ExpenseBreakdownData {
    name: string;
    value: number;
    fill: string;
    [key: string]: string | number;
}

interface ExpenseBreakdownChartProps {
    data: ExpenseBreakdownData[];
    formatCurrency: (value: number) => string;
}

export function ExpenseBreakdownChart({
    data,
    formatCurrency,
}: ExpenseBreakdownChartProps) {
    const COLORS = [
        'hsl(220 70% 50%)',
        'hsl(160 60% 45%)',
        'hsl(30 80% 55%)',
        'hsl(280 65% 60%)',
        'hsl(340 75% 55%)',
        'hsl(200 70% 50%)',
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (data.length === 0 || total === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No expense data this month
            </div>
        );
    }

    // Ensure data has index signature for recharts compatibility
    const chartData: ExpenseBreakdownData[] = data.map((item) => ({
        ...item,
    }));

    return (
        <ChartContainer className="h-[280px]">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                        `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                >
                    {data.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>
                <Tooltip
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0];
                            return (
                                <div className="rounded-lg border bg-background p-3 shadow-md">
                                    <p className="text-sm font-medium">
                                        {data.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatCurrency(data.value as number)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {(
                                            ((data.value as number) / total) *
                                            100
                                        ).toFixed(1)}
                                        % of total
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
            </PieChart>
        </ChartContainer>
    );
}
