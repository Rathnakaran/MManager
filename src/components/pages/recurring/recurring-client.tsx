
'use client';

import { useState, useEffect, useTransition } from 'react';
import type { RecurringTransaction } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Repeat } from 'lucide-react';
import RecurringForm from './recurring-form';
import { useToast } from '@/hooks/use-toast';
import { 
    addRecurringTransaction, 
    deleteRecurringTransaction, 
    updateRecurringTransaction,
    getRecurringTransactions, 
    getBudgetCategories,
    getUserIdFromCookie
} from '@/lib/actions';


interface RecurringClientProps {
  initialRecurring: RecurringTransaction[];
  initialCategories: string[];
}

export default function RecurringClient({ initialRecurring, initialCategories }: RecurringClientProps) {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(initialRecurring);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<RecurringTransaction | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleEdit = (item: RecurringTransaction) => {
    setSelected(item);
    setSheetOpen(true);
  };

  const handleAddNew = () => {
    setSelected(null);
    setSheetOpen(true);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setSelected(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;
    startTransition(async () => {
        try {
          await deleteRecurringTransaction(id);
          setRecurringTransactions(prev => prev.filter(item => item.id !== id));
          toast({ title: 'Success', description: 'Recurring transaction deleted.' });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete recurring transaction.' });
        }
    });
  };

  const onFormSubmit = (values: Omit<RecurringTransaction, 'id' | 'userId'>, id?: string) => {
    startTransition(async () => {
        const userId = await getUserIdFromCookie();
        if (!userId) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }

        const recurringData = { ...values, userId };

        try {
            if (id) {
                const updated = await updateRecurringTransaction(id, recurringData);
                setRecurringTransactions(prev => prev.map(item => item.id === id ? updated : item));
                toast({ title: 'Success', description: 'Recurring transaction updated.' });
            } else {
                const newRec = await addRecurringTransaction(recurringData);
                setRecurringTransactions(prev => [newRec, ...prev]);
                toast({ title: 'Success', description: 'Recurring transaction added.' });
            }
            handleSheetClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong.' });
        }
    });
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    
  const getFrequencyText = (item: RecurringTransaction) => {
      if(item.frequency === 'Monthly' && item.dayOfMonth) {
        return `On day ${item.dayOfMonth}`;
      }
      return item.frequency;
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-headline">Recurring Transactions</h1>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Recurring
                </Button>
            </SheetTrigger>
            <SheetContent onInteractOutside={handleSheetClose} onEscapeKeyDown={handleSheetClose}>
                <SheetHeader>
                <SheetTitle>{selected ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}</SheetTitle>
                </SheetHeader>
                <RecurringForm
                    recurringTransaction={selected}
                    categories={categories}
                    onFinished={handleSheetClose}
                    onFormSubmit={onFormSubmit}
                />
            </SheetContent>
            </Sheet>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Automated Money Moves</CardTitle>
                <CardDescription>Set it and forget it. Your financial life on autopilot.</CardDescription>
            </CardHeader>
            <CardContent className='divide-y divide-border'>
                <div className="hidden md:grid md:grid-cols-12 items-center px-4 py-2 font-semibold">
                    <div className="col-span-4">Description</div>
                    <div className="col-span-3">Category</div>
                    <div className="col-span-2">Frequency</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-1"></div>
                </div>
                 {recurringTransactions.map((item) => (
                    <div key={item.id} className="grid grid-cols-2 md:grid-cols-12 items-center px-4 py-3 gap-y-2">
                        <div className="col-span-2 md:col-span-4 flex flex-col">
                            <span className="font-medium">{item.description}</span>
                            <span className="md:hidden text-sm text-muted-foreground">{item.category}</span>
                        </div>
                        <div className="hidden md:col-span-3 md:block"><Badge variant="outline">{item.category}</Badge></div>
                        <div className="md:col-span-2 text-muted-foreground text-sm">{getFrequencyText(item)}</div>
                        <div className={`md:col-span-2 font-medium text-right ${item.type === 'income' ? 'text-green-500' : 'text-destructive'}`}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                        </div>
                        <div className="md:col-span-1 text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(item)} disabled={isPending}>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={isPending}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="bg-muted/50 border-t p-4 mt-4 text-center text-sm text-muted-foreground justify-center">
                <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4"/>
                    <div>
                        <p className="font-semibold">Automatic Logging Coming Soon!</p>
                        <p>These will be logged automatically in the future.</p>
                    </div>
                </div>
            </CardFooter>
        </Card>
    </div>
  );
}
