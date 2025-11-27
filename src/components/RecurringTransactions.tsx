'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
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
import { Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Money } from '@/components/Money';

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
    dayOfMonth: z.string().refine((val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 1 && num <= 31;
    }, {
        message: 'Day must be between 1 and 31.',
    }),
});

interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
}

interface RecurringTransaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    dayOfMonth: number;
    categoryId: string;
}

export function RecurringTransactions() {
    const [open, setOpen] = useState(false);
    const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: '',
            amount: '',
            type: 'expense',
            categoryId: '',
            dayOfMonth: '1',
        },
    });

    const fetchRecurring = async () => {
        const res = await fetch('/api/recurring');
        const data = await res.json();
        setRecurring(data);
    };

    const fetchCategories = async () => {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
    };

    useEffect(() => {
        fetchRecurring();
        fetchCategories();
    }, []);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await fetch('/api/recurring', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error('Failed to create recurring transaction');
            }

            toast.success('Recurring transaction created');
            setOpen(false);
            form.reset();
            fetchRecurring();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create recurring transaction');
        }
    }

    async function handleDelete(id: string) {
        try {
            await fetch(`/api/recurring?id=${id}`, {
                method: 'DELETE',
            });
            toast.success('Recurring transaction deleted');
            fetchRecurring();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete');
        }
    }

    const filteredCategories = categories.filter(
        (c) => c.type === form.watch('type')
    );

    return (
        <Card className="glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Recurring Transactions
                </CardTitle>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">Add New</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Recurring Transaction</DialogTitle>
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
                                                <Input placeholder="Rent" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dayOfMonth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Day of Month</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="1" max="31" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    form.setValue('categoryId', '');
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
                                <Button type="submit" className="w-full">Save Recurring Transaction</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recurring.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div>
                                <p className="font-medium">{item.description}</p>
                                <p className="text-xs text-muted-foreground">
                                    Day {item.dayOfMonth} • {item.type}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}>
                                    <Money amount={item.amount} />
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(item.id)}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {recurring.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                            No recurring transactions set up.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
