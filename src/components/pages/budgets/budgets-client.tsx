
'use client';

import { useState } from 'react';
import type { Budget } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { deleteBudget } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getIconByName } from '@/components/icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import BudgetForm from './budget-form';

interface BudgetsClientProps {
  initialBudgets: Budget[];
}

export default function BudgetsClient({ initialBudgets }: BudgetsClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const { toast } = useToast();

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setSheetOpen(true);
  };

  const handleAddNew = () => {
    setSelectedBudget(null);
    setSheetOpen(true);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setSelectedBudget(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget category?')) return;
    try {
      await deleteBudget(id);
      toast({
        title: 'Success',
        description: 'Budget category deleted successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete budget category.',
      });
    }
  };
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Budgets</h1>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          </SheetTrigger>
          <SheetContent onInteractOutside={handleSheetClose} onEscapeKeyDown={handleSheetClose}>
            <SheetHeader>
              <SheetTitle>{selectedBudget ? 'Edit Budget' : 'Add New Budget'}</SheetTitle>
            </SheetHeader>
            <BudgetForm
              budget={selectedBudget}
              onFinished={handleSheetClose}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initialBudgets.map((budget) => {
          const Icon = getIconByName(budget.icon);
          return (
            <Card key={budget.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg font-medium">{budget.category}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(budget)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(budget.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(budget.amount)}</div>
                <p className="text-xs text-muted-foreground">monthly budget</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
