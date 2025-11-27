'use client';

import { useCurrency } from '@/context/CurrencyContext';
import { useEffect, useState } from 'react';

export function Money({ amount }: { amount: number }) {
    const { formatAmount } = useCurrency();
    const [formatted, setFormatted] = useState<string>('');

    useEffect(() => {
        setFormatted(formatAmount(amount));
    }, [amount, formatAmount]);

    if (!formatted) {
        // Render a placeholder or the raw amount to avoid layout shift, 
        // but raw amount might look bad if it's just a number.
        // We'll render a skeleton or just invisible text to hold space?
        // Or just render with default formatting (INR) to match server?
        // Let's render nothing until hydrated to avoid mismatch.
        return <span className="opacity-0">{amount}</span>;
    }

    return <span>{formatted}</span>;
}
