
'use client';

import * as React from 'react';
import type { Transaction } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO, isSameDay } from 'date-fns';
import {
  addTransaction,
  updateTransaction,
  getBudgetCategories,
  getGoalCategories,
  getUserIdFromCookie,
} from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import TransactionForm from '../transactions/transaction-form';
import { Card, CardContent } from '@/components/ui/card';

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

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
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
      onDataChange();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong.' });
    }
  };


  const DayWithDetails = ({ date, displayMonth }: { date: Date, displayMonth: Date }) => {
    const dayTransactions = transactions.filter(t => isSameDay(parseISO(t.date), date));

    const dailyTotalExpenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="h-full w-full cursor-pointer p-1">
            <div className="relative flex flex-col items-center justify-center h-full w-full rounded-md">
              <span>{format(date, 'd')}</span>
              {dailyTotalExpenses > 0 && (
                <Badge variant="destructive" className="absolute bottom-1 text-xs px-1 h-4">
                  {formatCurrency(dailyTotalExpenses)}
                </Badge>
              )}
            </div>
          </div>
        </PopoverTrigger>
        {dayTransactions.length > 0 && (
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium leading-none">{format(date, 'PPP')}</h4>
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-4">
                  {dayTransactions.map(t => (
                    <div key={t.id} className="flex justify-between items-center text-sm cursor-pointer hover:bg-muted/50 p-1 rounded-md" onClick={() => handleEdit(t)}>
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
        )}
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
      <Card>
        <CardContent className="p-0 sm:p-4">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0 sm:p-3"
                classNames={{
                    root: 'w-full',
                    table: 'w-full',
                    row: 'w-full flex-1',
                }}
                components={{
                Day: DayWithDetails
                }}
            />
        </CardContent>
      </Card>
    </>
  );
}
