
'use client';

import type { Goal } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface GoalProgressProps {
  goals: Goal[];
}

export function GoalProgress({ goals }: GoalProgressProps) {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  if (goals.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Goal Progress
            </CardTitle>
            <CardDescription>"Sketch pota, lifeu jeichidalam!" (If you make a plan, you can win at life!)</CardDescription>
        </div>
        <Button asChild variant="secondary">
            <Link href="/goals">View All Goals</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.slice(0, 3).map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                </div>
                <Progress value={progress} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
