'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const formSchema = z.object({
    description: z.string().min(2, {
        message: 'Description must be at least 2 characters.',
    }),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number.',
    }),
    type: z.enum(['income', 'expense']),
    categoryId: z.string().min(1, {
        message: 'Please select a category.',
    }),
    walletId: z.string().min(1, {
        message: 'Please select a wallet.',
    }),
});

interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
}

interface Wallet {
    id: string;
    name: string;
}

interface AddTransactionDialogProps {
    initialValues?: {
        amount?: string;
        description?: string;
        categoryId?: string;
        type?: 'income' | 'expense';
        walletId?: string;
    };
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddTransactionDialog({ initialValues, open: controlledOpen, onOpenChange }: AddTransactionDialogProps = {}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange! : setInternalOpen;

    const [categories, setCategories] = useState<Category[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: initialValues?.description || '',
            amount: initialValues?.amount || '',
            type: initialValues?.type || 'expense',
            categoryId: initialValues?.categoryId || '',
            walletId: initialValues?.walletId || '',
        },
    });

    // Update form when initialValues change
    useEffect(() => {
        if (initialValues) {
            if (initialValues.description) form.setValue('description', initialValues.description);
            if (initialValues.amount) form.setValue('amount', initialValues.amount);
            if (initialValues.type) form.setValue('type', initialValues.type);
            if (initialValues.categoryId) form.setValue('categoryId', initialValues.categoryId);
            if (initialValues.walletId) form.setValue('walletId', initialValues.walletId);
        }
    }, [initialValues, form]);

    useEffect(() => {
        if (open) {
            fetch('/api/categories')
                .then((res) => res.json())
                .then((data) => setCategories(data));
            fetch('/api/wallets')
                .then((res) => res.json())
                .then((data) => {
                    setWallets(data);
                    // Set default wallet if none selected and wallets exist
                    if (data.length > 0 && !form.getValues('walletId')) {
                        form.setValue('walletId', data[0].id);
                    }
                });
        }
    }, [open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    date: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add transaction');
            }

            const data = await response.json();

            if (data.isOverBudget) {
                toast.error(`Budget Alert: You have exceeded your budget for ${data.categoryName}!`, {
                    duration: 5000,
                });
            } else {
                toast.success('Transaction added successfully');
            }

            form.reset();
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add transaction');
        }
    }

    const filteredCategories = categories.filter(
        (c) => c.type === form.watch('type')
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button>Add Transaction</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>
                        Add a new transaction to your history.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Groceries" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0.00" type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('categoryId', ''); // Reset category when type changes
                                        }}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {filteredCategories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="walletId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wallet / Account</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select wallet" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {wallets.map((wallet) => (
                                                <SelectItem key={wallet.id} value={wallet.id}>
                                                    {wallet.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
