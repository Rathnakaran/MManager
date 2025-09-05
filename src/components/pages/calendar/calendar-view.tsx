
'use client';

import type { Transaction } from '@/types';
import {
  getBudgetCategories,
  getGoalCategories,
  getUserIdFromCookie,
  addTransaction,
  updateTransaction
} from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import TransactionForm from '../transactions/transaction-form';
import type { CalendarViewType } from './calendar-client';
import MonthlyView from './monthly-view';
import WeeklyView from './weekly-view';
import DailyView from './daily-view';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface CalendarViewProps {
  transactions: Transaction[];
  onDataChange: () => void;
  view: CalendarViewType;
}

export default function CalendarView({ transactions, onDataChange, view }: CalendarViewProps) {
  const [categories, setCategories] = useState<{ budgetCategories: string[]; goalCategories: string[] }>({ budgetCategories: [], goalCategories: [] });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
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
    const transactionData = { ...values, userId, date: values.date };

    try {
      if (id) {
        await updateTransaction(id, transactionData);
        toast({ title: 'Success', description: 'Transaction updated.' });
      } else {
        await addTransaction(transactionData);
        toast({ title: 'Success', description: 'Transaction added.' });
      }
      setSheetOpen(false);
      setSelectedTransaction(null);
      onDataChange();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong.' });
    }
  };

  const renderView = () => {
    switch(view) {
      case 'monthly':
        return <MonthlyView transactions={transactions} onTransactionSelect={handleEdit} />;
      case 'weekly':
        return <WeeklyView transactions={transactions} onTransactionSelect={handleEdit} />;
      case 'daily':
          return <DailyView transactions={transactions} onTransactionSelect={handleEdit} />;
      default:
        return null;
    }
  }

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
                onFinished={() => {
                  setSheetOpen(false);
                  setSelectedTransaction(null);
                }}
                onFormSubmit={onFormSubmit}
            />
        </SheetContent>
      </Sheet>
      
      {renderView()}
    </>
  );
}
