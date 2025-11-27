'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';

interface DataControlsProps {
    transactions: any[];
}

export function DataControls({ transactions }: DataControlsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [isImporting, setIsImporting] = useState(false);

    const handleExport = () => {
        if (transactions.length === 0) {
            toast.error('No transactions to export');
            return;
        }

        // Prepare data for CSV
        const csvData = transactions.map(t => ({
            Date: new Date(t.date).toLocaleDateString(),
            Description: t.description,
            Amount: t.amount,
            Type: t.type,
            Category: t.categoryName || 'Uncategorized' // Assuming we might have this or need to look it up
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const importedData = results.data.map((row: any) => ({
                        date: row.Date || row.date,
                        description: row.Description || row.description,
                        amount: row.Amount || row.amount,
                        type: row.Type || row.type,
                        category: row.Category || row.category
                    }));

                    const res = await fetch('/api/transactions/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ transactions: importedData }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        toast.success(`Successfully imported ${data.count} transactions`);
                        router.refresh();
                    } else {
                        toast.error('Failed to import transactions');
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    toast.error('Error processing import file');
                } finally {
                    setIsImporting(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            },
            error: (error) => {
                console.error('CSV Parse Error:', error);
                toast.error('Error parsing CSV file');
                setIsImporting(false);
            }
        });
    };

    return (
        <div className="flex gap-2">
            <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
            <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportClick} disabled={isImporting}>
                {isImporting ? (
                    <FileSpreadsheet className="mr-2 h-4 w-4 animate-pulse" />
                ) : (
                    <Upload className="mr-2 h-4 w-4" />
                )}
                {isImporting ? 'Importing...' : 'Import CSV'}
            </Button>
        </div>
    );
}
