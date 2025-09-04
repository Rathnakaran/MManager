
'use client';

import type { Transaction, Budget } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getIconByName } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';

interface BudgetStatusProps {
  transactions: Transaction[];
  budgets: Budget[];
  view: 'monthly' | 'yearly';
}

export function BudgetStatus({ transactions, budgets, view }: BudgetStatusProps) {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const budgetWithSpending = useMemo(() => {
    const multiplier = view === 'yearly' ? 12 : 1;
    return budgets.map(budget => {
      const totalBudget = budget.amount * multiplier;
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      const progress = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
      const remaining = totalBudget - spent;
      return { ...budget, spent, progress, remaining, totalBudget };
    });
  }, [budgets, transactions, view]);

  const periodText = useMemo(() => {
    const now = new Date();
    if (view === 'monthly') {
        return `Are you a king or a beggar this ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}?`;
    }
    return `How is your spending for the year ${now.getFullYear()}?`;
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
              const Icon = getIconByName(item.icon);
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p className="text-xs text-muted-foreground">Spent {formatCurrency(item.spent)}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${item.remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>
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
