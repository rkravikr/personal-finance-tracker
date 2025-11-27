'use client';

import { useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface OverviewChartProps {
    data: {
        name: string;
        total: number;
    }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
    const [activeBar, setActiveBar] = useState<string | null>(null);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length && label === activeBar) {
            return (
                <div className="rounded-lg border bg-popover p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Total
                            </span>
                            <span className="font-bold text-muted-foreground">
                                ${payload[0].value}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    content={(props) => <CustomTooltip {...props} />}
                    cursor={false}
                />
                <Bar
                    dataKey="total"
                    fill="#adfa1d"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                    onMouseEnter={(data: any) => setActiveBar(data.name)}
                    onMouseLeave={() => setActiveBar(null)}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
