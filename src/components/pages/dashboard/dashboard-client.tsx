
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Transaction, Budget, Goal } from '@/types';
import { StatCards } from './stat-cards';
import { ExpenseChart } from './charts';
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

const getCurrentMonthValue = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function DashboardClient({
  transactions,
  budgets,
  goals,
}: DashboardClientProps) {
  const [welcomeMessage, setWelcomeMessage] = useState(welcomeMessages[0]);
  const [view, setView] = useState<string>(getCurrentMonthValue());

  useEffect(() => {
    // This runs only on the client, after the initial render, to avoid hydration mismatch
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setWelcomeMessage(welcomeMessages[randomIndex]);
  }, []);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => {
        months.add(t.date.substring(0, 7)); // 'YYYY-MM'
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    if (view === 'yearly') {
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getFullYear() === currentYear;
        });
    }

    // Month view 'YYYY-MM'
    return transactions.filter(t => t.date.startsWith(view));

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
    const isYearly = view === 'yearly';
    const multiplier = isYearly ? 12 : 1;
    
    // For yearly view, sum up all monthly budgets and multiply by 12.
    // For monthly view, it's just the sum of monthly budgets.
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0) * multiplier;
    
    const remainingBudget = totalBudget - totalSpent;
    return { totalBudget, remainingBudget };
  }, [budgets, totalSpent, view]);

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

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
