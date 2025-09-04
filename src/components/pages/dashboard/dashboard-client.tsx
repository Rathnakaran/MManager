
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Transaction, Budget, Goal } from '@/types';
import { StatCards } from './stat-cards';
import { ExpenseChart } from './charts';
import { BudgetStatus } from './budget-status';
import { AiAdvisor } from './ai-advisor';
import { GoalProgress } from './goal-progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardClientProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
}

const welcomeMessages = [
  "Welcome Back, Boss!",
  "Enna, selavu panrathuku ready ah?",
  "Vanakkam, Thalaiva!",
  "Hey Champion, let's win the finance game!",
  "Vaanga, 'FinWise' pannalam!",
  "Kalakunga, Sir!",
];

export default function DashboardClient({
  transactions,
  budgets,
  goals,
}: DashboardClientProps) {
  const [welcomeMessage, setWelcomeMessage] = useState(welcomeMessages[0]);
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    // This runs only on the client, after the initial render, to avoid hydration mismatch
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setWelcomeMessage(welcomeMessages[randomIndex]);
  }, []);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    if (view === 'monthly') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      });
    }
    // Yearly view
    const currentYear = now.getFullYear();
    return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === currentYear;
    });
  }, [transactions, view]);

  const { totalSpent, expenseBreakdown } = useMemo(() => {
    const expenseBreakdown: Record<string, number> = {};
    const totalSpent = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => {
        if (!expenseBreakdown[t.category]) {
            expenseBreakdown[t.category] = 0;
        }
        expenseBreakdown[t.category] += t.amount;
        return sum + t.amount;
      }, 0);

      return { totalSpent, expenseBreakdown };
  }, [filteredTransactions]);

  const { totalBudget, remainingBudget } = useMemo(() => {
    const multiplier = view === 'yearly' ? 12 : 1;
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0) * multiplier;
    const remainingBudget = totalBudget - totalSpent;
    return { totalBudget, remainingBudget };
  }, [budgets, totalSpent, view]);

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold font-headline">{welcomeMessage}</h1>
            <Tabs value={view} onValueChange={(value) => setView(value as 'monthly' | 'yearly')} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-2 sm:w-[200px]">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
            </Tabs>
      </div>

      <StatCards
        totalSpent={totalSpent}
        remainingBudget={remainingBudget}
        totalBudget={totalBudget}
        view={view}
      />
      
      <AiAdvisor
        totalSpent={totalSpent}
        remainingBudget={remainingBudget}
        expenseBreakdown={expenseBreakdown}
      />

      <GoalProgress goals={goals} />
      
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ExpenseChart data={expenseBreakdown} />
        </div>
        <div className="lg:col-span-2">
          <BudgetStatus transactions={filteredTransactions} budgets={budgets} view={view} />
        </div>
      </div>
    </div>
  );
}
