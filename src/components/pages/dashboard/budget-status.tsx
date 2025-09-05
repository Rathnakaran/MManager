
'use client';

import type { Transaction, Budget } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface BudgetStatusProps {
  transactions: Transaction[];
  budgets: Budget[];
  view: string; // 'yearly' or 'YYYY-MM'
}

export function BudgetStatus({ transactions, budgets, view }: BudgetStatusProps) {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const budgetWithSpending = useMemo(() => {
    const isYearly = view === 'yearly';
    return budgets.map(budget => {
      const totalBudget = budget.amount * (isYearly ? 12 : 1);
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      const remaining = totalBudget - spent;
      return { ...budget, spent, remaining, totalBudget };
    });
  }, [budgets, transactions, view]);

  const periodText = useMemo(() => {
    if (view === 'yearly') {
        const year = new Date().getFullYear();
        return `Are you a king or a beggar this ${year}?`;
    }
    const [year, month] = view.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = date.toLocaleString('default', { month: 'long' });
    return `Are you a king or a beggar this ${monthName} ${date.getFullYear()}?`;
  }, [view]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs. Actuals</CardTitle>
        <CardDescription>{periodText}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {budgetWithSpending.map(item => {
              const isOverspent = item.remaining < 0;
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isOverspent ? (
                      <XCircle className="h-6 w-6 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p className="text-xs text-muted-foreground">
                        Spent {formatCurrency(item.spent)} of {formatCurrency(item.totalBudget)}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${isOverspent ? 'text-destructive' : 'text-primary'}`}>
                    {formatCurrency(item.remaining)}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
