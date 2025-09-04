'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CircleDollarSign, PiggyBank, Landmark } from 'lucide-react';
import { useMemo } from 'react';

interface StatCardsProps {
  totalSpent: number;
  remainingBudget: number;
  totalBudget: number;
}

export function StatCards({ totalSpent, remainingBudget, totalBudget }: StatCardsProps) {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const budgetProgress = useMemo(() => {
        if (totalBudget === 0) return 0;
        return (totalSpent / totalBudget) * 100;
    }, [totalSpent, totalBudget]);

    return (
        <div>
            <h1 className="text-3xl font-bold font-headline mb-4">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent (This Month)</CardTitle>
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                        <p className="text-xs text-muted-foreground">in expenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
                        <PiggyBank className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-destructive' : 'text-primary'}`}>{formatCurrency(remainingBudget)}</div>
                        <p className="text-xs text-muted-foreground">of {formatCurrency(totalBudget)} total budget</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Budget Progress</CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         <div className="text-2xl font-bold mb-2">{budgetProgress.toFixed(0)}%</div>
                         <Progress value={budgetProgress} aria-label={`${budgetProgress.toFixed(0)}% of budget spent`} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
