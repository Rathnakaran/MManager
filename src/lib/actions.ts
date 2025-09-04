'use server';

import { revalidatePath } from 'next/cache';
import {
  sampleTransactions,
  sampleBudgets,
  sampleGoals,
  sampleRecurring,
} from './seed-data';
import type { Transaction, Budget, Goal, Recurring } from '@/types';

// Simulate a database
let transactions: Transaction[] = sampleTransactions.map((t, i) => ({ ...t, id: `trans-${i}` }));
let budgets: Budget[] = sampleBudgets.map((b, i) => ({ ...b, id: `budget-${i}` }));
let goals: Goal[] = sampleGoals.map((g, i) => ({ ...g, id: `goal-${i}` }));
let recurring: Recurring[] = sampleRecurring.map((r, i) => ({ ...r, id: `recur-${i}` }));

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Data Fetching ---
export async function getData() {
  await delay(500);
  return {
    transactions,
    budgets,
    goals,
    recurring,
  };
}

export async function getTransactions() {
  await delay(200);
  return transactions;
}

export async function getBudgets() {
  await delay(200);
  return budgets;
}

export async function getBudgetCategories() {
    await delay(100);
    return budgets.map(b => b.category);
}


// --- Transaction Actions ---
export async function addTransaction(transactionData: Omit<Transaction, 'id'>) {
  await delay(500);
  const newTransaction: Transaction = {
    ...transactionData,
    id: `trans-${Date.now()}`,
  };
  transactions.unshift(newTransaction);
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  return { success: true, transaction: newTransaction };
}

export async function updateTransaction(id: string, transactionData: Partial<Transaction>) {
  await delay(500);
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...transactionData };
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    return { success: true, transaction: transactions[index] };
  }
  return { success: false, message: 'Transaction not found' };
}

export async function deleteTransaction(id: string) {
  await delay(500);
  transactions = transactions.filter(t => t.id !== id);
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  return { success: true };
}


// --- Budget Actions ---
export async function addBudget(budgetData: Omit<Budget, 'id'>) {
    await delay(500);
    const newBudget: Budget = {
      ...budgetData,
      id: `budget-${Date.now()}`,
    };
    budgets.push(newBudget);
    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true, budget: newBudget };
  }

// --- Placeholder actions for other features ---

export async function getGoals() {
  await delay(200);
  return goals;
}

export async function getRecurring() {
  await delay(200);
  return recurring;
}

export async function importTransactions(data: any[]) {
    await delay(1000);
    const newTransactions: Transaction[] = data.map(row => ({
        id: `trans-${Date.now()}-${Math.random()}`,
        date: new Date(row.Date).toISOString(),
        description: row.Description,
        amount: parseFloat(row.Amount),
        type: parseFloat(row.Amount) >= 0 ? 'income' : 'expense',
        category: row.Category,
    }));
    transactions.unshift(...newTransactions);
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    return { success: true, count: newTransactions.length };
}
