'use client';

import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Money } from '@/components/Money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BudgetProgressProps {
    budgets: {
        category: string;
        budget: number;
        spent: number;
        percentage: number;
    }[];
}

export function BudgetProgress({ budgets }: BudgetProgressProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">Budget Planner</CardTitle>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                            {isOpen ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-6 pt-4">
                        {budgets.map((item, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.category}</span>
                                        {item.percentage >= 80 && (
                                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                                        )}
                                    </div>
                                    <span className="text-muted-foreground">
                                        <Money amount={item.spent} /> / <Money amount={item.budget} />
                                    </span>
                                </div>
                                <Progress
                                    value={Math.min(item.percentage, 100)}
                                    className={`h-2 ${item.percentage >= 100
                                        ? 'bg-rose-100 [&>div]:bg-rose-500'
                                        : item.percentage >= 80
                                            ? 'bg-amber-100 [&>div]:bg-amber-500'
                                            : 'bg-emerald-100 [&>div]:bg-emerald-500'
                                        }`}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{item.percentage.toFixed(1)}% used</span>
                                    <span><Money amount={Math.max(item.budget - item.spent, 0)} /> left</span>
                                </div>
                            </div>
                        ))}
                        {budgets.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground">
                                No budgets set. Go to Categories to set limits.
                            </p>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
