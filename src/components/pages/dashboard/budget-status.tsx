
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
import { CheckCircle2 } from 'lucide-react';

interface BudgetStatusProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export function BudgetStatus({ transactions, budgets }: BudgetStatusProps) {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const budgetWithSpending = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const progress = (spent / budget.amount) * 100;
    const remaining = budget.amount - spent;
    return { ...budget, spent, progress, remaining };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs. Actuals</CardTitle>
        <CardDescription>Are you a king or a beggar this October 2023?</CardDescription>
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
