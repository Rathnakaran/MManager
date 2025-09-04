
'use client';

import { useState, useEffect } from 'react';
import type { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DataTable } from './data-table';
import { columns } from './columns';
import TransactionForm from './transaction-form';
import { FileDown, FileUp, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importTransactions } from '@/lib/actions';
import Papa from 'papaparse';


interface TransactionsClientProps {
  initialTransactions: Transaction[];
  categories: { budgetCategories: string[], goalCategories: string[] };
}

const transactionTitles = [
    "Your 'Kanaku-Pillai' Diary",
    "Kanaku Ellam Correct-a Irukanum!",
    "Where did the money go, machi?",
    "Every Rupee tells a story",
];

export default function TransactionsClient({ initialTransactions, categories }: TransactionsClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [title, setTitle] = useState(transactionTitles[0]);
  const { toast } = useToast();
  
  useEffect(() => {
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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // @ts-ignore
            const { count } = await importTransactions(results.data);
            toast({
              title: "Import Successful",
              description: `${count} transactions have been imported.`,
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
    }
  };

  const handleExport = () => {
    const csv = Papa.unparse(initialTransactions);
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


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">{title}</h1>
        <div className='flex gap-2'>
            <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Export
            </Button>
            <Button asChild variant="outline">
              <label htmlFor="csv-import">
                <FileUp className="mr-2 h-4 w-4" />
                Import
                <input type="file" id="csv-import" accept=".csv" onChange={handleImport} className="sr-only" />
              </label>
            </Button>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                    <Button onClick={handleAddNew}>
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
                    />
                </SheetContent>
            </Sheet>
        </div>
      </div>
      <DataTable columns={columns(handleEdit)} data={initialTransactions} />
    </div>
  );
}
