
'use client';

import * as React from 'react';
import type { Transaction } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import TransactionForm from '../transactions/transaction-form';
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getBudgetCategories,
  getGoalCategories,
  getUserIdFromCookie,
} from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

interface CalendarViewProps {
  transactions: Transaction[];
  onDataChange: () => void;
}

export default function CalendarView({ transactions, onDataChange }: CalendarViewProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [categories, setCategories] = React.useState<{ budgetCategories: string[]; goalCategories: string[] }>({ budgetCategories: [], goalCategories: [] });
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchCategories = async () => {
      const userId = await getUserIdFromCookie();
      if (!userId) return;
      const [budgetCats, goalCats] = await Promise.all([
        getBudgetCategories(userId),
        getGoalCategories(userId),
      ]);
      setCategories({ budgetCategories: budgetCats, goalCategories: goalCats });
    };
    fetchCategories();
  }, []);

  const transactionsByDay = React.useMemo(() => {
    return transactions.reduce((acc, t) => {
      const date = parseISO(t.date);
      const day = format(date, 'yyyy-MM-dd');
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

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSheetOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTransaction(null);
    setSheetOpen(true);
  };

  const onFormSubmit = async (values: Omit<Transaction, 'id' | 'userId' | 'date'> & { date: Date }, id?: string) => {
    const userId = await getUserIdFromCookie();
    if (!userId) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    const transactionData = { ...values, userId };

    try {
      if (id) {
        await updateTransaction(id, transactionData);
        toast({ title: 'Success', description: 'Transaction updated.' });
      } else {
        await addTransaction(transactionData);
        toast({ title: 'Success', description: 'Transaction added.' });
      }
      setSheetOpen(false);
      onDataChange(); // Refresh data
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong.' });
    }
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
                        <div key={t.id} className="flex justify-between items-center text-sm cursor-pointer hover:bg-muted/50 p-1 rounded-md" onClick={() => handleEdit(t)}>
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
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>{selectedTransaction ? 'Edit Transaction' : 'Add New Transaction'}</SheetTitle>
            </SheetHeader>
            <TransactionForm
                transaction={selectedTransaction}
                categories={categories}
                onFinished={() => setSheetOpen(false)}
                onFormSubmit={onFormSubmit}
            />
        </SheetContent>
      </Sheet>

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
    </>
  );
}
