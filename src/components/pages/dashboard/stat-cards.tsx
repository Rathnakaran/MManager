
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CircleDollarSign, PiggyBank, BarChart } from 'lucide-react';
import { useMemo } from 'react';

interface StatCardsProps {
  totalSpent: number;
  remainingBudget: number;
  totalBudget: number;
  view: string; // 'yearly' or 'YYYY-MM'
}

export function StatCards({ totalSpent, remainingBudget, totalBudget, view }: StatCardsProps) {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    const budgetProgress = useMemo(() => {
        if (totalBudget === 0) return 0;
        return (totalSpent / totalBudget) * 100;
    }, [totalSpent, totalBudget]);

    const periodText = useMemo(() => {
        if (view === 'yearly') {
            return `for ${new Date().getFullYear()}`;
        }
        const [year, month] = view.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return `for ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    }, [view]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Kaasu Selavu</CardTitle>
                    <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-bold">{formatCurrency(totalSpent)}</div>
                    <p className="text-xs text-muted-foreground">{periodText}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Meedhi Kaasu</CardTitle>
                    <PiggyBank className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-xl font-bold`}>{formatCurrency(remainingBudget)}</div>
                    <p className="text-xs text-muted-foreground">of {formatCurrency(totalBudget)} total budget</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Progress Report</CardTitle>
                    <BarChart className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     <p className="text-sm text-muted-foreground mb-2">You've spent <span className="font-bold text-foreground">{budgetProgress.toFixed(0)}%</span> of your budget.</p>
                     <Progress value={Math.min(budgetProgress, 100)} aria-label={`${budgetProgress.toFixed(0)}% of budget spent`} className="h-2" />
                </CardContent>
            </Card>
        </div>
    );
}
