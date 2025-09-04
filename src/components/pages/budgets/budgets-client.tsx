
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Budget, Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { deleteBudget } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getIconByName } from '@/components/icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import BudgetForm from './budget-form';

interface BudgetsClientProps {
  initialBudgets: Budget[];
  initialTransactions: Transaction[];
}

const budgetTitles = [
    "The Budgeting Battlefield",
    "Plan Your Selavu, Thalaiva!",
    "Kaasu... Panam... Dhuttu... Money!",
    "Budget Podu, Life-a Maathu!",
];

export default function BudgetsClient({ initialBudgets, initialTransactions }: BudgetsClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [title, setTitle] = useState(budgetTitles[0]);
  const { toast } = useToast();

  useEffect(() => {
    setTitle(budgetTitles[Math.floor(Math.random() * budgetTitles.length)]);
  }, []);

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

  const budgetData = useMemo(() => {
    return initialBudgets.map(budget => {
      const spent = initialTransactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      const remaining = budget.amount - spent;
      
      let status: 'On Track' | 'Overspent' | 'N/A' = 'On Track';
      if (budget.amount === 0) {
        status = 'N/A';
      } else if (spent > budget.amount) {
        status = 'Overspent';
      }

      return {
        ...budget,
        spent,
        remaining,
        status,
      }
    })
  }, [initialBudgets, initialTransactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">{title}</h1>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleAddNew} className="bg-yellow-400 text-black hover:bg-yellow-500">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Pudhiya Budget
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

      <Card>
        <CardHeader>
            <CardTitle>Your Budget Breakdown</CardTitle>
            <CardDescription>Don't let your money just 'go with the flow'. Give it a plan!</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/4">Category</TableHead>
                        <TableHead className="text-right">Budget</TableHead>
                        <TableHead className="text-right">Spent</TableHead>
                        <TableHead className="text-right">Remaining</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {budgetData.map((budget) => {
                        const Icon = getIconByName(budget.icon);
                        return (
                            <TableRow key={budget.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium">{budget.category}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(budget.amount)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(budget.spent)}</TableCell>
                                <TableCell className={`text-right font-medium ${budget.remaining < 0 ? 'text-destructive' : 'text-green-500'}`}>
                                    {formatCurrency(budget.remaining)}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={budget.status === 'Overspent' ? 'destructive' : 'default'} className={budget.status === 'On Track' ? 'bg-yellow-400 text-black' : ''}>
                                        {budget.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(budget)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
