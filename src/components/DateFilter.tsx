'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';

export function DateFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get('dateRange') || 'all';

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === 'all') {
            params.delete('dateRange');
        } else {
            params.set('dateRange', value);
        }
        router.push(`/?${params.toString()}`);
    };

    return (
        <Select value={currentFilter} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[180px] glass-card">
                <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
        </Select>
    );
}
