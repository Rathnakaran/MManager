
'use client';

import { useState, useEffect, useTransition } from 'react';
import type { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DataTable } from './data-table';
import { columns } from './columns';
import TransactionForm from './transaction-form';
import { FileDown, FileUp, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
    importTransactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    getTransactions,
    getBudgetCategories,
    getGoalCategories
} from '@/lib/actions';
import Papa from 'papaparse';
import { Skeleton } from '@/components/ui/skeleton';


interface TransactionsClientProps {}

const transactionTitles = [
    "Your 'Kanaku-Pillai' Diary",
    "Kanaku Ellam Correct-a Irukanum!",
    "Where did the money go, machi?",
    "Every Rupee tells a story",
];

export default function TransactionsClient({}: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<{ budgetCategories: string[], goalCategories: string[] }>({ budgetCategories: [], goalCategories: [] });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [title, setTitle] = useState(transactionTitles[0]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    const fetchData = async () => {
        const userId = localStorage.getItem('loggedInUserId');
        if (!userId) return;

        setIsLoading(true);
        try {
            const [transactionsData, budgetCats, goalCats] = await Promise.all([
                getTransactions(userId),
                getBudgetCategories(userId),
                getGoalCategories(userId)
            ]);
            setTransactions(transactionsData);
            setCategories({ budgetCategories: budgetCats, goalCategories: goalCats });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch transaction data.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchData();
    setTitle(transactionTitles[Math.floor(Math.random() * transactionTitles.length)]);
  }, [toast]);

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSheetOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedTransaction(null);
    setSheetOpen(true);
  }
  
  const handleSheetClose = () => {
      setSheetOpen(false);
      setSelectedTransaction(null);
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    startTransition(async () => {
        try {
            await deleteTransaction(id);
            setTransactions(prev => prev.filter(t => t.id !== id));
            toast({ title: 'Success', description: 'Transaction deleted successfully.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete transaction.' });
        }
    });
  };

  const onFormSubmit = (values: Omit<Transaction, 'id' | 'userId'>, id?: string) => {
    startTransition(async () => {
      const userId = localStorage.getItem('loggedInUserId');
      if (!userId) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
      }
      
      const transactionData = { ...values, userId };

      try {
        if (id) {
          const updatedTransaction = await updateTransaction(id, transactionData);
          setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
          toast({ title: 'Success', description: 'Transaction updated successfully.' });
        } else {
          const newTransaction = await addTransaction(transactionData);
          setTransactions(prev => [newTransaction, ...prev]);
          toast({ title: 'Success', description: 'Transaction added successfully.' });
        }
        handleSheetClose();
      } catch (error) {
        console.error("Form submission error:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong.' });
      }
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const userId = localStorage.getItem('loggedInUserId');
    if (!file || !userId) return;

    startTransition(async () => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
              try {
                const newTransactions = await importTransactions(userId, results.data);
                setTransactions(prev => [...newTransactions, ...prev]);
                toast({
                  title: "Import Successful",
                  description: `${results.data.length} transactions have been imported.`,
                });
              } catch (error) {
                toast({
                  variant: "destructive",
                  title: "Import Failed",
                  description: "Could not import transactions.",
                });
              }
            },
          });
    });
  };

  const handleExport = () => {
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Started", description: "Your transaction data is being downloaded."});
  };

  if (isLoading) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-1/3" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">{title}</h1>
        <div className='flex gap-2'>
            <Button variant="outline" onClick={handleExport} disabled={isPending}>
                <FileDown className="mr-2 h-4 w-4" />
                Export
            </Button>
            <Button asChild variant="outline" disabled={isPending}>
              <label htmlFor="csv-import">
                <FileUp className="mr-2 h-4 w-4" />
                Import
                <input type="file" id="csv-import" accept=".csv" onChange={handleImport} className="sr-only" disabled={isPending} />
              </label>
            </Button>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                    <Button onClick={handleAddNew} disabled={isPending}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Transaction
                    </Button>
                </SheetTrigger>
                <SheetContent onInteractOutside={handleSheetClose} onEscapeKeyDown={handleSheetClose}>
                    <SheetHeader>
                        <SheetTitle>{selectedTransaction ? 'Edit Transaction' : 'Add New Transaction'}</SheetTitle>
                    </SheetHeader>
                    <TransactionForm 
                        transaction={selectedTransaction} 
                        categories={categories}
                        onFinished={handleSheetClose}
                        onFormSubmit={onFormSubmit}
                    />
                </SheetContent>
            </Sheet>
        </div>
      </div>
      <DataTable columns={columns(handleEdit, handleDelete)} data={transactions} />
    </div>
  );
}
