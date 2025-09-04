'use client';

import type { Transaction, Budget } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getIconByName } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BudgetStatusProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export function BudgetStatus({ transactions, budgets }: BudgetStatusProps) {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const budgetWithSpending = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const progress = (spent / budget.amount) * 100;
    return { ...budget, spent, progress };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs. Actuals</CardTitle>
        <CardDescription>How you're tracking against your budget.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-6">
            {budgetWithSpending.map(item => {
              const Icon = getIconByName(item.icon);
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.category}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(item.spent)} / {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <Progress value={item.progress} />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
