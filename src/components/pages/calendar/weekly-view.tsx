
'use client';

import * as React from 'react';
import type { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface WeeklyViewProps {
  transactions: Transaction[];
  onTransactionSelect: (transaction: Transaction) => void;
}

export default function WeeklyView({ transactions, onTransactionSelect }: WeeklyViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });

  const weeklyTransactions = React.useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }, [transactions, start, end]);

  const groupedByDay = React.useMemo(() => {
    return weeklyTransactions.reduce((acc, t) => {
      const day = format(parseISO(t.date), 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = { transactions: [], total: 0 };
      }
      acc[day].transactions.push(t);
      if (t.type === 'expense') {
        acc[day].total -= t.amount;
      } else {
        acc[day].total += t.amount;
      }
      return acc;
    }, {} as Record<string, { transactions: Transaction[], total: number }>);
  }, [weeklyTransactions]);

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Summary</CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground font-medium">
              {format(start, 'dd MMM')} - {format(end, 'dd MMM, yyyy')}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-border border rounded-lg overflow-hidden">
          {daysOfWeek.map(day => {
            const dayString = format(day, 'yyyy-MM-dd');
            const dayData = groupedByDay[dayString];
            const isToday = isSameDay(day, new Date());
            
            return (
              <div key={dayString} className={`p-3 bg-background ${isToday ? 'bg-muted/50' : ''}`}>
                <h3 className={`font-semibold text-center mb-2 ${isToday ? 'text-primary' : ''}`}>
                  {format(day, 'EEE, d')}
                </h3>
                <Separator />
                <div className="mt-2 space-y-2 min-h-[100px]">
                  {dayData?.transactions.map(t => (
                    <div key={t.id} 
                        className="text-xs p-1.5 rounded-md cursor-pointer hover:bg-muted"
                        onClick={() => onTransactionSelect(t)}>
                      <p className="font-medium truncate">{t.description}</p>
                      <p className={`${t.type === 'expense' ? 'text-destructive' : 'text-green-500'}`}>
                        {t.type === 'expense' ? '-' : '+'}
                        {formatCurrency(t.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
}
