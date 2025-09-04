
'use client';

import { useState, useEffect } from 'react';
import type { Transaction, Budget, Goal } from '@/types';
import { StatCards } from './stat-cards';
import { ExpenseChart } from './charts';
import { BudgetStatus } from './budget-status';
import { AiAdvisor } from './ai-advisor';
import { GoalProgress } from './goal-progress';

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

  useEffect(() => {
    // This runs only on the client, after the initial render, to avoid hydration mismatch
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setWelcomeMessage(welcomeMessages[randomIndex]);
  }, []);

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const remainingBudget = totalBudget - totalSpent;

  const expenseBreakdown = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += t.amount;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-headline">{welcomeMessage}</h1>

      <StatCards
        totalSpent={totalSpent}
        remainingBudget={remainingBudget}
        totalBudget={totalBudget}
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
          <BudgetStatus transactions={transactions} budgets={budgets} />
        </div>
      </div>
    </div>
  );
}
