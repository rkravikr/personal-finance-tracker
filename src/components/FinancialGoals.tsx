'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Target, Wallet } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Money } from '@/components/Money';
import { toast } from 'sonner';
import { CollapsibleCard } from './CollapsibleCard';

interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    color: string;
}

export function FinancialGoals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [open, setOpen] = useState(false);
    const [addFundsOpen, setAddFundsOpen] = useState<string | null>(null);
    const [newGoal, setNewGoal] = useState({
        name: '',
        targetAmount: '',
        deadline: '',
        color: '#3b82f6'
    });
    const [amountToAdd, setAmountToAdd] = useState('');

    const fetchGoals = async () => {
        try {
            const res = await fetch('/api/goals');
            if (res.ok) {
                const data = await res.json();
                setGoals(data);
            }
        } catch (error) {
            console.error('Failed to fetch goals', error);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleCreateGoal = async () => {
        if (!newGoal.name || !newGoal.targetAmount) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newGoal),
            });

            if (res.ok) {
                toast.success('Goal created successfully');
                setOpen(false);
                setNewGoal({ name: '', targetAmount: '', deadline: '', color: '#3b82f6' });
                fetchGoals();
            } else {
                toast.error('Failed to create goal');
            }
        } catch (error) {
            toast.error('Error creating goal');
        }
    };

    const handleAddFunds = async (id: string, currentAmount: number) => {
        if (!amountToAdd || isNaN(Number(amountToAdd))) return;

        try {
            const res = await fetch('/api/goals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    currentAmount: currentAmount + Number(amountToAdd)
                }),
            });

            if (res.ok) {
                toast.success('Funds added successfully');
                setAddFundsOpen(null);
                setAmountToAdd('');
                fetchGoals();
            } else {
                toast.error('Failed to add funds');
            }
        } catch (error) {
            toast.error('Error adding funds');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/goals?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Goal deleted');
                fetchGoals();
            } else {
                toast.error('Failed to delete goal');
            }
        } catch (error) {
            toast.error('Error deleting goal');
        }
    };

    return (
        <CollapsibleCard title="Financial Goals" defaultOpen={false}>
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {goals.map((goal) => {
                        const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        return (
                            <Card key={goal.id} className="glass-card border-none relative overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 w-1 h-full"
                                    style={{ backgroundColor: goal.color }}
                                />
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{goal.name}</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(goal.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-2xl font-bold">
                                            <span><Money amount={goal.currentAmount} /></span>
                                            <span className="text-sm font-normal text-muted-foreground self-end mb-1">
                                                of <Money amount={goal.targetAmount} />
                                            </span>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>{percentage.toFixed(1)}%</span>
                                            {goal.deadline && (
                                                <span>Target: {new Date(goal.deadline).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        <Dialog open={addFundsOpen === goal.id} onOpenChange={(open) => !open && setAddFundsOpen(null)}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full mt-2"
                                                    onClick={() => setAddFundsOpen(goal.id)}
                                                >
                                                    <Wallet className="mr-2 h-4 w-4" />
                                                    Add Funds
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Add Funds to {goal.name}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Amount</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={amountToAdd}
                                                            onChange={(e) => setAmountToAdd(e.target.value)}
                                                        />
                                                    </div>
                                                    <Button onClick={() => handleAddFunds(goal.id, goal.currentAmount)} className="w-full">
                                                        Add Funds
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-full min-h-[180px] border-dashed flex flex-col gap-2 hover:bg-accent/50">
                                <Plus className="h-8 w-8 text-muted-foreground" />
                                <span className="text-muted-foreground">Create New Goal</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Financial Goal</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Goal Name</Label>
                                    <Input
                                        placeholder="e.g., Trip to Goa"
                                        value={newGoal.name}
                                        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Amount</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={newGoal.targetAmount}
                                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Date (Optional)</Label>
                                    <Input
                                        type="date"
                                        value={newGoal.deadline}
                                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Color Tag</Label>
                                    <div className="flex gap-2">
                                        {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((c) => (
                                            <button
                                                key={c}
                                                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${newGoal.color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setNewGoal({ ...newGoal, color: c })}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={handleCreateGoal} className="w-full">Create Goal</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </CollapsibleCard>
    );
}
