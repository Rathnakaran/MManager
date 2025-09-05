
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
    getGoalCategories,
    getUserIdFromCookie
} from '@/lib/actions';
import Papa from 'papaparse';
import AppLoader from '@/components/layout/app-loader';


interface TransactionsClientProps {}

const transactionTitles = [
    "Your 'Kanaku-Pillai' Diary",
    "Kanaku Ellam Correct-a Irukanum!",
    "Where did the money go, machi?",
    "Every Rupee tells a story",
];

const sortTransactions = (transactions: Transaction[]) => {
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function TransactionsClient({}: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<{ budgetCategories: string[], goalCategories: string[] }>({ budgetCategories: [], goalCategories: [] });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [title, setTitle] = useState(transactionTitles[0]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const fetchData = async () => {
    const userId = await getUserIdFromCookie();
    if (!userId) {
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    try {
        const [transactionsData, budgetCats, goalCats] = await Promise.all([
            getTransactions(userId),
            getBudgetCategories(userId),
            getGoalCategories(userId)
        ]);
        setTransactions(sortTransactions(transactionsData));
        setCategories({ budgetCategories: budgetCats, goalCategories: goalCats });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch transaction data.' });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setTitle(transactionTitles[Math.floor(Math.random() * transactionTitles.length)]);
  }, []);

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

  const onFormSubmit = (values: Omit<Transaction, 'id' | 'userId' | 'date'> & { date: Date }, id?: string) => {
    startTransition(async () => {
      const userId = await getUserIdFromCookie();
      if (!userId) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
      }
      
      const transactionData = { ...values, userId };

      try {
        if (id) {
          const updatedTransaction = await updateTransaction(id, transactionData);
          setTransactions(prev => sortTransactions(prev.map(t => t.id === id ? updatedTransaction : t)));
          toast({ title: 'Success', description: 'Transaction updated successfully.' });
        } else {
          const newTransaction = await addTransaction(transactionData);
          setTransactions(prev => sortTransactions([newTransaction, ...prev]));
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
    if (!file) return;

    startTransition(async () => {
        const userId = await getUserIdFromCookie();
        if (!userId) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
              try {
                // The action already revalidates the path, so we can just refetch
                await importTransactions(userId, results.data);
                await fetchData();
                toast({
                  title: "Import Successful",
                  description: `${results.data.length} transactions have been imported.`,
                });
              } catch (error) {
                toast({
                  variant: "destructive",
                  title: "Import Failed",
                  description: "Could not import transactions. Please check the file format.",
                });
              }
            },
            error: () => {
                toast({
                    variant: "destructive",
                    title: "Import Error",
                    description: "Failed to parse the CSV file.",
                });
            }
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
        <div className="fixed inset-0 bg-background z-50">
            <AppLoader />
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
