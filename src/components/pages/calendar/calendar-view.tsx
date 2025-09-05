
'use client';

import * as React from 'react';
import type { Transaction } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  transactions: Transaction[];
}

export default function CalendarView({ transactions }: CalendarViewProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const transactionsByDay = React.useMemo(() => {
    return transactions.reduce((acc, t) => {
      const day = t.date;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [transactions]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const getSpendingLevelClass = (amount: number) => {
    if (amount === 0) return '';
    if (amount < 500) return 'bg-green-500/20 hover:bg-green-500/30';
    if (amount <= 2000) return 'bg-yellow-500/20 hover:bg-yellow-500/30';
    return 'bg-red-500/20 hover:bg-red-500/30';
  };

  const DayWithDetails = ({ date, displayMonth }: { date: Date, displayMonth: Date }) => {
    const isOutside = date.getMonth() !== displayMonth.getMonth();
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTransactions = transactionsByDay[dateStr] || [];
    
    const dailyTotalExpenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const dailyTotalIncome = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const spendingClass = getSpendingLevelClass(dailyTotalExpenses);

    const cellContent = (
      <div className={cn("relative flex flex-col items-center justify-center h-full w-full rounded-md", !isOutside && spendingClass)}>
        <span>{format(date, 'd')}</span>
        {dailyTotalExpenses > 0 && (
          <Badge variant="destructive" className="absolute bottom-1 text-xs px-1 h-4">
            {formatCurrency(dailyTotalExpenses)}
          </Badge>
        )}
        {dailyTotalIncome > dailyTotalExpenses && (
           <Badge variant="default" className="absolute bottom-1 text-xs px-1 h-4 bg-primary text-primary-foreground">
             +{formatCurrency(dailyTotalIncome - dailyTotalExpenses)}
           </Badge>
        )}
      </div>
    );

    if (dayTransactions.length === 0 || isOutside) {
      return <div className="h-full w-full p-1">{cellContent}</div>;
    }
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="h-full w-full cursor-pointer p-1">{cellContent}</div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium leading-none">{format(date, 'PPP')}</h4>
            <ScrollArea className="h-48">
              <div className="space-y-2 pr-4">
                {dayTransactions.length > 0 ? (
                    dayTransactions.map(t => (
                        <div key={t.id} className="flex justify-between items-center text-sm">
                            <span className="flex-1 truncate pr-2">{t.description}</span>
                            <span className={`font-medium ${t.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No transactions for this day.</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border p-0"
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-4",
        month: "space-y-4 w-full",
        table: "w-full border-collapse",
        head_row: "flex justify-around",
        head_cell:"w-full text-muted-foreground rounded-md font-normal text-[0.8rem]",
        row: "flex w-full mt-2 justify-around",
        cell: "h-20 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-full w-full p-0", // Changed padding to 0
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
      }}
      components={{
        Day: DayWithDetails
      }}
    />
  );
}
