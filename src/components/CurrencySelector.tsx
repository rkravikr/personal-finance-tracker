'use client';

import { useCurrency } from '@/context/CurrencyContext';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function CurrencySelector() {
    const { currency, setCurrency } = useCurrency();

    return (
        <Select value={currency} onValueChange={(value: any) => setCurrency(value)}>
            <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
        </Select>
    );
}
