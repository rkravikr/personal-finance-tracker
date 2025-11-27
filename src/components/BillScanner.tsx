'use client';

import { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScannedData {
    amount?: string;
    date?: string;
    description?: string;
    categoryId?: string;
}

interface BillScannerProps {
    onScanComplete: (data: ScannedData) => void;
}

export function BillScanner({ onScanComplete }: BillScannerProps) {
    const [isScanning, setIsScanning] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        const toastId = toast.loading('Scanning bill...');

        try {
            const worker = await createWorker('eng');
            const ret = await worker.recognize(file);
            const text = ret.data.text;
            await worker.terminate();

            console.log('Scanned text:', text);

            // Basic parsing logic
            const data: ScannedData = {};

            // 1. Extract Amount (largest number with 2 decimal places)
            const amountRegex = /\d+\.\d{2}/g;
            const amounts = text.match(amountRegex);
            if (amounts) {
                // Find the largest amount, assuming it's the total
                const maxAmount = amounts
                    .map((a) => parseFloat(a))
                    .reduce((a, b) => Math.max(a, b), 0);
                data.amount = maxAmount.toString();
            }

            // 2. Extract Date (simple formats like MM/DD/YYYY or YYYY-MM-DD)
            const dateRegex = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(\d{4}[/-]\d{1,2}[/-]\d{1,2})/;
            const dateMatch = text.match(dateRegex);
            if (dateMatch) {
                // Try to parse the date to ISO string
                try {
                    const dateObj = new Date(dateMatch[0]);
                    if (!isNaN(dateObj.getTime())) {
                        data.date = dateObj.toISOString();
                    }
                } catch (e) {
                    console.warn("Failed to parse date", e);
                }
            }

            // 3. Guess Category (keyword matching)
            const lowerText = text.toLowerCase();
            if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('cafe')) {
                // We need to map this to an ID later, for now just pass a hint or handle in parent
                // Let's try to find a category by name in the parent, but here we can just pass the text
            }

            // 4. Description (first line or merchant name)
            const lines = text.split('\n').filter(line => line.trim().length > 0);
            if (lines.length > 0) {
                data.description = lines[0].substring(0, 50); // First line as merchant
            }

            toast.dismiss(toastId);
            toast.success('Bill scanned successfully!');
            onScanComplete(data);

        } catch (error) {
            console.error(error);
            toast.dismiss(toastId);
            toast.error('Failed to scan bill');
        } finally {
            setIsScanning(false);
            // Reset file input
            e.target.value = '';
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={isScanning}
            />
            <Button variant="outline" disabled={isScanning}>
                {isScanning ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scanning...
                    </>
                ) : (
                    <>
                        <Camera className="mr-2 h-4 w-4" />
                        Scan Bill
                    </>
                )}
            </Button>
        </div>
    );
}
