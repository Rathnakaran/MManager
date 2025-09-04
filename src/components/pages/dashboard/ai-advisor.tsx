'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getFinancialAdvice, type FinancialAdviceOutput } from '@/ai/flows/ai-financial-advisor';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';

interface AiAdvisorProps {
  totalSpent: number;
  remainingBudget: number;
  expenseBreakdown: Record<string, number>;
}

export function AiAdvisor({ totalSpent, remainingBudget, expenseBreakdown }: AiAdvisorProps) {
  const [advice, setAdvice] = useState<FinancialAdviceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdvice() {
      try {
        setIsLoading(true);
        const result = await getFinancialAdvice({
          totalSpent,
          remainingBudget,
          expenseBreakdown,
        });
        setAdvice(result);
      } catch (error) {
        console.error('Failed to get financial advice:', error);
        setAdvice({ summary: 'Could not load financial advice at this time.' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdvice();
  }, [totalSpent, remainingBudget, expenseBreakdown]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          AI Financial Advisor
        </CardTitle>
        <CardDescription>
          Personalized insights to help you manage your finances better.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : advice ? (
          <div>
            <p className="mb-4 text-sm">{advice.summary}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
