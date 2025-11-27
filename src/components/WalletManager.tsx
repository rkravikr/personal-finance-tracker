'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Wallet as WalletIcon, CreditCard, Landmark, Banknote } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Money } from '@/components/Money';
import { toast } from 'sonner';

interface Wallet {
    id: string;
    name: string;
    type: 'cash' | 'bank' | 'credit' | 'wallet';
    initialBalance: number;
    color: string;
}

export function WalletManager() {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [mainOpen, setMainOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [newWallet, setNewWallet] = useState({
        name: '',
        type: 'cash',
        initialBalance: '',
        color: '#3b82f6'
    });

    const fetchWallets = async () => {
        try {
            const res = await fetch('/api/wallets');
            if (res.ok) {
                const data = await res.json();
                setWallets(data);
            }
        } catch (error) {
            console.error('Failed to fetch wallets', error);
        }
    };

    useEffect(() => {
        if (mainOpen) fetchWallets();
    }, [mainOpen]);

    const handleCreateWallet = async () => {
        if (!newWallet.name) {
            toast.error('Please enter a wallet name');
            return;
        }

        try {
            const res = await fetch('/api/wallets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newWallet),
            });

            if (res.ok) {
                toast.success('Wallet created successfully');
                setCreateOpen(false);
                setNewWallet({ name: '', type: 'cash', initialBalance: '', color: '#3b82f6' });
                fetchWallets();
            } else {
                toast.error('Failed to create wallet');
            }
        } catch (error) {
            toast.error('Error creating wallet');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will not delete transactions associated with this wallet.')) return;

        try {
            const res = await fetch(`/api/wallets?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Wallet deleted');
                fetchWallets();
            } else {
                toast.error('Failed to delete wallet');
            }
        } catch (error) {
            toast.error('Error deleting wallet');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'bank': return <Landmark className="h-5 w-5" />;
            case 'credit': return <CreditCard className="h-5 w-5" />;
            case 'cash': return <Banknote className="h-5 w-5" />;
            default: return <WalletIcon className="h-5 w-5" />;
        }
    };

    return (
        <Dialog open={mainOpen} onOpenChange={setMainOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <WalletIcon className="h-4 w-4" />
                    Wallets
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Wallets & Accounts</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {wallets.map((wallet) => (
                            <Card key={wallet.id} className="glass-card border-none relative overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 w-1 h-full"
                                    style={{ backgroundColor: wallet.color }}
                                />
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        {getIcon(wallet.type)}
                                        {wallet.name}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(wallet.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        <Money amount={wallet.initialBalance} />
                                    </div>
                                    <p className="text-xs text-muted-foreground capitalize">{wallet.type}</p>
                                </CardContent>
                            </Card>
                        ))}

                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="h-full min-h-[120px] border-dashed flex flex-col gap-2 hover:bg-accent/50">
                                    <Plus className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-muted-foreground">Add Wallet</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Wallet / Account</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            placeholder="e.g., HDFC Bank, Cash"
                                            value={newWallet.name}
                                            onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select
                                            value={newWallet.type}
                                            onValueChange={(val) => setNewWallet({ ...newWallet, type: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="bank">Bank Account</SelectItem>
                                                <SelectItem value="credit">Credit Card</SelectItem>
                                                <SelectItem value="wallet">Digital Wallet (UPI)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Initial Balance</Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={newWallet.initialBalance}
                                            onChange={(e) => setNewWallet({ ...newWallet, initialBalance: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Color Tag</Label>
                                        <div className="flex gap-2">
                                            {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((c) => (
                                                <button
                                                    key={c}
                                                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${newWallet.color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                                    style={{ backgroundColor: c }}
                                                    onClick={() => setNewWallet({ ...newWallet, color: c })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <Button onClick={handleCreateWallet} className="w-full">Create Wallet</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
