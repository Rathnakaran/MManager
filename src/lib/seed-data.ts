
import type { Transaction, Budget, Goal, RecurringTransaction } from '@/types';

const today = new Date();
const currentMonth = today.toISOString().slice(0, 7);

export const sampleBudgets: Omit<Budget, 'id' | 'userId'>[] = [
  // All sample budgets removed as per user request.
];

export const sampleTransactions: Omit<Transaction, 'id' | 'userId'>[] = [
  // All sample transactions removed as per user request.
];

export const sampleGoals: Omit<Goal, 'id' | 'userId'>[] = [
  // All sample goals removed as per user request.
];

export const sampleRecurringTransactions: Omit<RecurringTransaction, 'id' | 'userId'>[] = [
    // All sample recurring transactions removed as per user request.
];


export const getBudgetCategories = () => sampleBudgets.map(b => b.category);
