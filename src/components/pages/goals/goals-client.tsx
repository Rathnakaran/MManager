
'use client';

import { useState, useEffect } from 'react';
import type { Goal } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Target } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { deleteGoal } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import GoalForm from './goal-form';

interface GoalsClientProps {
  initialGoals: Goal[];
}

const goalTitles = [
    "Your Future, Your Sketch!",
    "Sketch Pota, Life-u Jeichidalam!",
    "Set Your Goals, Make it 'Brand'!",
    "Dream Big, Plan Bigger!",
];

export default function GoalsClient({ initialGoals }: GoalsClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [title, setTitle] = useState(goalTitles[0]);
  const { toast } = useToast();

  useEffect(() => {
    setTitle(goalTitles[Math.floor(Math.random() * goalTitles.length)]);
  }, []);

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setSheetOpen(true);
  };

  const handleAddNew = () => {
    setSelectedGoal(null);
    setSheetOpen(true);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setSelectedGoal(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await deleteGoal(id);
      toast({
        title: 'Success!',
        description: 'Goal deleted. "Mind voice: Annan innoru thadava koopdapattar!"',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete goal.',
      });
    }
  };
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">{title}</h1>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </SheetTrigger>
          <SheetContent onInteractOutside={handleSheetClose} onEscapeKeyDown={handleSheetClose}>
            <SheetHeader>
              <SheetTitle>{selectedGoal ? 'Edit Goal' : 'Add New Goal'}</SheetTitle>
              <CardDescription>"Sketch pota, sketchu!"</CardDescription>
            </SheetHeader>
            <GoalForm
              goal={selectedGoal}
              onFinished={handleSheetClose}
            />
          </SheetContent>
        </Sheet>
      </div>
        {initialGoals.length === 0 ? (
            <Card className="text-center py-12">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Target className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle>"Enna da, plan eh illama vandhuruka?"</CardTitle>
                    <CardDescription>You haven't set any goals yet. Click "Add Goal" to get started!</CardDescription>
                </CardHeader>
            </Card>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {initialGoals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                    <Card key={goal.id}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                        <div className='space-y-1.5'>
                            <CardTitle className="text-lg font-medium">{goal.name}</CardTitle>
                            <CardDescription>Target: {formatDate(goal.targetDate)}</CardDescription>
                        </div>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(goal)}>
                            Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(goal.id)}
                            >
                            Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-2xl font-bold">{formatCurrency(goal.currentAmount)}</span>
                                <span className="text-sm text-muted-foreground"> of {formatCurrency(goal.targetAmount)}</span>
                            </div>
                            <Progress value={progress} />
                        </div>
                        <p className="text-xs text-muted-foreground pt-1">{progress.toFixed(0)}% complete. "Therikka vidalama!"</p>
                    </CardContent>
                    </Card>
                );
                })}
            </div>
        )}
    </div>
  );
}
