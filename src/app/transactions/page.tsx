'use client';

import { Money } from '@/components/Money';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { EditTransactionDialog } from '@/components/EditTransactionDialog';
import { BillScanner } from '@/components/BillScanner';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DataControls } from '@/components/DataControls';

interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    type: 'income' | 'expense';
    categoryId: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const router = useRouter();
    const { status } = useSession();

    // State for Bill Scanner integration
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [scannedData, setScannedData] = useState<{
        amount?: string;
        description?: string;
        categoryId?: string;
        type?: 'income' | 'expense';
    }>({});

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/transactions')
                .then((res) => res.json())
                .then((data) => setTransactions(data.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())));
        }
    }, [status]);

    async function handleDelete(id: string) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            await fetch(`/api/transactions/${id}`, {
                method: 'DELETE',
            });
            // Refresh list
            const res = await fetch('/api/transactions');
            const data = await res.json();
            setTransactions(data.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            router.refresh();
        }
    }

    const handleScanComplete = (data: any) => {
        setScannedData({
            amount: data.amount,
            description: data.description,
            type: 'expense', // Assume bills are expenses
            // categoryId: data.categoryId // If we mapped it
        });
        setIsAddDialogOpen(true);
    };

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                <div className="flex gap-2">
                    <DataControls transactions={transactions} />
                    <BillScanner onScanComplete={handleScanComplete} />
                    <AddTransactionDialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                        initialValues={scannedData}
                    />
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>{/* Category Name lookup would go here */}</TableCell>
                                <TableCell className={`text-right ${transaction.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {transaction.type === 'income' ? '+' : '-'}<Money amount={transaction.amount} />
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <EditTransactionDialog transaction={transaction} />
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                                        <Trash2 className="h-4 w-4 text-rose-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
