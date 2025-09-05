
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Transaction, Budget, Goal, RecurringTransaction } from '@/types';
import { StatCards } from './stat-cards';
import { BudgetStatus } from './budget-status';
import { AiAdvisor } from './ai-advisor';
import { GoalProgress } from './goal-progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getData, getUserIdFromCookie } from '@/lib/actions';
import AppLoader from '@/components/layout/app-loader';
import PowerBiReport from './power-bi-report';

interface DashboardClientProps {}

const welcomeMessages = [
  "Welcome Back, Boss!",
  "Enna, selavu panrathuku ready ah?",
  "Vanakkam, Thalaiva!",
  "Hey Champion, let's win the finance game!",
  "Vaanga, 'FinWise' pannalam!",
  "Kalakunga, Sir!",
];

const getCurrentMonthValue = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function DashboardClient({}: DashboardClientProps) {
  const [welcomeMessage, setWelcomeMessage] = useState(welcomeMessages[0]);
  const [view, setView] = useState<string>(getCurrentMonthValue());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const userId = await getUserIdFromCookie();
        if (!userId) {
            setIsLoading(false); // Stop loading if no user
            return;
        };

        setIsLoading(true);
        getData(userId)
        .then(({ transactions, budgets, goals, recurringTransactions }) => {
            setTransactions(transactions);
            setBudgets(budgets);
            setGoals(goals);
            setRecurringTransactions(recurringTransactions);
        })
        .catch(() => {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load dashboard data.' });
        })
        .finally(() => {
            setIsLoading(false);
        });
    }
    
    fetchData();
    // This runs only on the client, after the initial render, to avoid hydration mismatch
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setWelcomeMessage(welcomeMessages[randomIndex]);
  }, [toast]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => {
        months.add(t.date.substring(0, 7)); // 'YYYY-MM'
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (view === 'yearly') {
        const currentYear = new Date().getFullYear();
        return transactions.filter(t => new Date(t.date).getFullYear() === currentYear);
    }
    return transactions.filter(t => t.date.startsWith(view));
}, [transactions, view]);

  const advisorData = useMemo(() => {
      const currentMonth = getCurrentMonthValue();
      
      const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
      
      const monthlyTotalSpent = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyTotalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
      const monthlyRemainingBudget = monthlyTotalBudget - monthlyTotalSpent;
      
      const monthlyExpenseBreakdown: Record<string, number> = {};
      monthlyTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!monthlyExpenseBreakdown[t.category]) {
                monthlyExpenseBreakdown[t.category] = 0;
            }
            monthlyExpenseBreakdown[t.category] += t.amount;
        });

      return {
        totalSpent: monthlyTotalSpent,
        remainingBudget: monthlyRemainingBudget,
        expenseBreakdown: monthlyExpenseBreakdown
      };
    }, [transactions, budgets]);

  const totalSpent = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const { totalBudget, remainingBudget } = useMemo(() => {
    const isYearly = view === 'yearly';
    
    const relevantBudgets = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalBudgetAmount = isYearly ? relevantBudgets * 12 : relevantBudgets;
    
    const remaining = totalBudgetAmount - totalSpent;
    return { totalBudget: totalBudgetAmount, remainingBudget: remaining };
  }, [budgets, totalSpent, view]);
  

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
      return (
        <div className="fixed inset-0 bg-background z-50">
            <AppLoader />
        </div>
      )
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl font-bold font-headline">{welcomeMessage}</h1>
            <Select value={view} onValueChange={setView}>
                <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Select a period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="yearly">This Year ({new Date().getFullYear()})</SelectItem>
                    {availableMonths.map(month => (
                        <SelectItem key={month} value={month}>
                            {formatMonth(month)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
      </div>

      <StatCards
        totalSpent={totalSpent}
        remainingBudget={remainingBudget}
        totalBudget={totalBudget}
        view={view}
      />
      
      <AiAdvisor
        totalSpent={advisorData.totalSpent}
        remainingBudget={advisorData.remainingBudget}
        expenseBreakdown={advisorData.expenseBreakdown}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <GoalProgress goals={goals} />
        <BudgetStatus transactions={filteredTransactions} budgets={budgets} view={view} />
      </div>

      <PowerBiReport />
    </div>
  );
}
