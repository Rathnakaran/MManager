
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
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchAdvice = () => {
    // Only fetch if we haven't fetched before, or if it's a manual refresh.
    if (!advice || !isLoading) {
      startTransition(async () => {
        setIsLoading(true);
        try {
          const result = await getFinancialAdvice({
            totalSpent,
            remainingBudget,
            expenseBreakdown,
          });
          setAdvice(result);
        } catch (error) {
          console.error('Failed to get financial advice:', error);
          setAdvice({ summary: 'Could not load financial advice. You may have hit the free tier limit.' });
        } finally {
          setIsLoading(false);
        }
      });
    }
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
        ) : advice ? (
          <div>
            <p className="text-muted-foreground">{advice.summary}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
