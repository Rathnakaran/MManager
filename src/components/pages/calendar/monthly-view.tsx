
'use client';

import * as React from 'react';
import type { Transaction } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO, isSameDay, isSameMonth, startOfMonth } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface MonthlyViewProps {
  transactions: Transaction[];
  onTransactionSelect: (transaction: Transaction) => void;
}

export default function MonthlyView({ transactions, onTransactionSelect }: MonthlyViewProps) {
  const [month, setMonth] = React.useState(startOfMonth(new Date()));

  const monthlyTransactions = React.useMemo(() => {
    return transactions.filter(t => isSameMonth(parseISO(t.date), month));
  }, [transactions, month]);
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const DayWithDetails = ({ date, displayMonth }: { date: Date, displayMonth: Date }) => {
    if (!isSameMonth(date, displayMonth)) {
      return <div className="h-full w-full"></div>;
    }

    const dayTransactions = monthlyTransactions.filter(t => isSameDay(parseISO(t.date), date));

    const dailyTotalExpenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
      <Popover>
        <PopoverTrigger asChild disabled={dayTransactions.length === 0}>
          <div className="h-full w-full cursor-pointer p-1">
            <div className="relative flex flex-col items-start justify-start h-full w-full rounded-md p-1">
              <span>{format(date, 'd')}</span>
              {dailyTotalExpenses > 0 && (
                <Badge variant="destructive" className="text-xs px-1 h-4 mt-1">
                  -{formatCurrency(dailyTotalExpenses)}
                </Badge>
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium leading-none">{format(date, 'PPP')}</h4>
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-4">
                  {dayTransactions.map(t => (
                    <div key={t.id} className="flex justify-between items-center text-sm cursor-pointer hover:bg-muted/50 p-1 rounded-md" onClick={() => onTransactionSelect(t)}>
                      <span className="flex-1 truncate pr-2">{t.description}</span>
                      <span className={`font-medium ${t.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
      </Popover>
    );
  };
  
  return (
    <Card>
      <CardContent className="p-0 sm:p-4">
          <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              className="p-0 sm:p-3"
              classNames={{
                cell: "h-24 w-full text-left text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-full w-full p-1 font-normal aria-selected:opacity-100",
              }}
              components={{
                Day: DayWithDetails
              }}
          />
      </CardContent>
    </Card>
  );
}
