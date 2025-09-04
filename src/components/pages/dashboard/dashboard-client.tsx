'use client';

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

export default function DashboardClient({
  transactions,
  budgets,
  goals,
}: DashboardClientProps) {
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
    <div className="grid gap-8">
      <StatCards
        totalSpent={totalSpent}
        remainingBudget={remainingBudget}
        totalBudget={totalBudget}
      />
      <div>
        <GoalProgress goals={goals} />
      </div>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ExpenseChart data={expenseBreakdown} />
        </div>
        <div className="lg:col-span-2">
          <BudgetStatus transactions={transactions} budgets={budgets} />
        </div>
      </div>
      <div>
        <AiAdvisor
          totalSpent={totalSpent}
          remainingBudget={remainingBudget}
          expenseBreakdown={expenseBreakdown}
        />
      </div>
    </div>
  );
}
