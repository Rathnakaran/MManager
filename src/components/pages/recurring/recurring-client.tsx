
'use client';

import { useState, useEffect } from 'react';
import type { Recurring } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PlusCircle } from 'lucide-react';
import RecurringForm from './recurring-form';
import RecurringTable from './recurring-table';

interface RecurringClientProps {
  initialRecurring: Recurring[];
  categories: string[];
}

const recurringTitles = [
    "Your Regular 'Varavu-Selavu'",
    "Varavu Ettana, Selavu Pathana?",
    "Master Your Monthly Bills",
    "Automate Your Finances, Thalaiva!",
];

export default function RecurringClient({ initialRecurring, categories }: RecurringClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedRecurring, setSelectedRecurring] = useState<Recurring | null>(null);
  const [title, setTitle] = useState(recurringTitles[0]);

  useEffect(() => {
    setTitle(recurringTitles[Math.floor(Math.random() * recurringTitles.length)]);
  }, []);

  const handleEdit = (recurring: Recurring) => {
    setSelectedRecurring(recurring);
    setSheetOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedRecurring(null);
    setSheetOpen(true);
  }
  
  const handleSheetClose = () => {
      setSheetOpen(false);
      setSelectedRecurring(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h1 className="text-2xl font-bold font-headline">{title}</h1>
            <p className="text-muted-foreground">Track your regular income and expenses.</p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Recurring
                </Button>
            </SheetTrigger>
            <SheetContent onInteractOutside={handleSheetClose} onEscapeKeyDown={handleSheetClose}>
                <SheetHeader>
                    <SheetTitle>{selectedRecurring ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}</SheetTitle>
                </SheetHeader>
                <RecurringForm 
                    recurring={selectedRecurring}
                    categories={categories}
                    onFinished={handleSheetClose}
                />
            </SheetContent>
        </Sheet>
      </div>
      <RecurringTable data={initialRecurring} onEdit={handleEdit} />
    </div>
  );
}
