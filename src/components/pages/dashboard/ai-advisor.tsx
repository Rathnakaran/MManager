
'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getFinancialAdvice, type FinancialAdviceOutput } from '@/ai/flows/ai-financial-advisor';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MiniLoader from '@/components/layout/mini-loader';

interface AiAdvisorProps {
  totalSpent: number;
  remainingBudget: number;
  expenseBreakdown: Record<string, number>;
}

export function AiAdvisor({ totalSpent, remainingBudget, expenseBreakdown }: AiAdvisorProps) {
  const [advice, setAdvice] = useState<FinancialAdviceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchAdvice = () => {
    startTransition(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getFinancialAdvice({
          totalSpent,
          remainingBudget,
          expenseBreakdown,
        });
        setAdvice(result);
      } catch (error: any) {
        console.error('Failed to get financial advice:', error);
        if (error.message && error.message.includes('503 Service Unavailable')) {
          setError('The AI Advisor is currently busy. Please try again in a moment.');
        } else {
          setError('Could not load financial advice. You may have hit the daily free tier limit.');
        }
        setAdvice(null);
      } finally {
        setIsLoading(false);
      }
    });
  }

  useEffect(() => {
    fetchAdvice();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>AI Financial Advisor</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchAdvice} disabled={isPending || isLoading}>
            <RotateCw className={`mr-2 h-4 w-4 ${isPending || isLoading ? 'animate-spin' : ''}`} />
            Retry
        </Button>
      </CardHeader>
      <CardContent className='h-[60px] flex items-center'>
        {isLoading ? (
            <div className='w-full'>
                <MiniLoader />
            </div>
        ) : error ? (
            <p className="text-destructive text-sm">{error}</p>
        ) : advice ? (
          <div>
            <p className="text-muted-foreground">{advice.summary}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
