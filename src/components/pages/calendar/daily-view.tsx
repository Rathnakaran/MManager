
'use client';

import * as React from 'react';
import type { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface DailyViewProps {
  transactions: Transaction[];
  onTransactionSelect: (transaction: Transaction) => void;
}

export default function DailyView({ transactions, onTransactionSelect }: DailyViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const dailyTransactions = React.useMemo(() => {
    return transactions.filter(t => isSameDay(parseISO(t.date), currentDate)).sort((a, b) => b.amount - a.amount);
  }, [transactions, currentDate]);

  const { totalIncome, totalExpense } = React.useMemo(() => {
    return dailyTransactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.totalIncome += t.amount;
        else acc.totalExpense += t.amount;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
  }, [dailyTransactions]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Daily Breakdown</CardTitle>
            <CardDescription>A closer look at your daily cash flow.</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground font-medium">
              {format(currentDate, 'PPP')}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center bg-muted p-3 rounded-lg mb-4">
            <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-lg font-bold text-green-500">{formatCurrency(totalIncome)}</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Total Expense</p>
                <p className="text-lg font-bold text-destructive">{formatCurrency(totalExpense)}</p>
            </div>
             <div>
                <p className="text-sm text-muted-foreground">Net Flow</p>
                <p className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {formatCurrency(totalIncome - totalExpense)}
                </p>
            </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          {dailyTransactions.length > 0 ? (
            dailyTransactions.map(t => (
              <div key={t.id} 
                  className="flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-muted/50"
                  onClick={() => onTransactionSelect(t)}>
                <div>
                  <p className="font-semibold">{t.description}</p>
                  <Badge variant="outline">{t.category}</Badge>
                </div>
                <p className={`font-bold text-lg ${t.type === 'expense' ? 'text-destructive' : 'text-green-500'}`}>
                  {t.type === 'expense' ? '-' : '+'}
                  {formatCurrency(t.amount)}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No transactions for this day.</p>
              <p className='text-sm'>"Summa iru, selava kammi pannu!" (Stay idle, spend less!)</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
