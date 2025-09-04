
'use client';

import { useState } from 'react';
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
import { deleteRecurringTransaction } from '@/lib/actions';


interface RecurringClientProps {
  initialRecurringTransactions: RecurringTransaction[];
  categories: string[];
}

export default function RecurringClient({ initialRecurringTransactions, categories }: RecurringClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<RecurringTransaction | null>(null);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;
    try {
      await deleteRecurringTransaction(id);
      toast({
        title: 'Success',
        description: 'Recurring transaction deleted.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete recurring transaction.',
      });
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    
  const getFrequencyText = (item: RecurringTransaction) => {
      if(item.frequency === 'Monthly' && item.dayOfMonth) {
        return `Monthly (Day ${item.dayOfMonth})`;
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
                <div className="hidden md:grid md:grid-cols-5 items-center px-4 py-2 font-semibold">
                    <div className="col-span-2">Description</div>
                    <div>Category</div>
                    <div>Frequency</div>
                    <div className="text-right">Amount</div>
                </div>
                 {initialRecurringTransactions.map((item) => (
                    <div key={item.id} className="grid grid-cols-3 md:grid-cols-5 items-center px-4 py-3">
                        <div className="col-span-3 md:col-span-2 font-medium">{item.description}</div>
                        <div className="hidden md:block"><Badge variant="outline">{item.category}</Badge></div>
                        <div className="text-muted-foreground text-sm">{getFrequencyText(item)}</div>
                        <div className={`font-medium text-right ${item.type === 'income' ? 'text-green-500' : 'text-destructive'}`}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                        </div>
                        <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(item.id)}
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

