
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


const getGoalKeyword = (goalName: string) => {
    return goalName.split(' ')[0];
}

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

  // Check if the transaction category is a goal contribution
  if (newTransaction.type === 'expense') {
      const goalIndex = goals.findIndex(g => getGoalKeyword(g.name) === newTransaction.category);
      if (goalIndex !== -1) {
          goals[goalIndex].currentAmount += newTransaction.amount;
          revalidatePath('/goals');
      }
  }


  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/recurring');
  return { success: true, transaction: newTransaction };
}

export async function updateTransaction(id: string, transactionData: Partial<Transaction>) {
  await delay(500);
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...transactionData };
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/recurring');
    revalidatePath('/goals');
    return { success: true, transaction: transactions[index] };
  }
  return { success: false, message: 'Transaction not found' };
}

export async function deleteTransaction(id: string) {
  await delay(500);
  transactions = transactions.filter(t => t.id !== id);
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/recurring');
  revalidatePath('/goals');
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

export async function updateBudget(id: string, budgetData: Partial<Budget>) {
    await delay(500);
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
        budgets[index] = { ...budgets[index], ...budgetData };
        revalidatePath('/budgets');
        revalidatePath('/dashboard');
        return { success: true, budget: budgets[index] };
    }
    return { success: false, message: 'Budget not found' };
}

export async function deleteBudget(id: string) {
    await delay(500);
    budgets = budgets.filter(b => b.id !== id);
    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true };
}

// --- Goal Actions ---
export async function getGoals() {
  await delay(200);
  return goals;
}

export async function getGoalCategories() {
    await delay(100);
    return goals.map(g => getGoalKeyword(g.name));
}

export async function addGoal(goalData: Omit<Goal, 'id'>) {
  await delay(500);
  const newGoal: Goal = {
    ...goalData,
    id: `goal-${Date.now()}`,
  };
  goals.push(newGoal);
  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true, goal: newGoal };
}

export async function updateGoal(id: string, goalData: Partial<Goal>) {
  await delay(500);
  const index = goals.findIndex(g => g.id === id);
  if (index !== -1) {
    goals[index] = { ...goals[index], ...goalData };
    revalidatePath('/goals');
    revalidatePath('/dashboard');
    return { success: true, goal: goals[index] };
  }
  return { success: false, message: 'Goal not found' };
}

export async function deleteGoal(id: string) {
  await delay(500);
  goals = goals.filter(g => g.id !== id);
  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true };
}


// --- Recurring Actions ---
export async function getRecurring() {
  await delay(200);
  return recurring;
}

export async function addRecurring(recurringData: Omit<Recurring, 'id'>) {
    await delay(500);
    const newRecurring: Recurring = {
        ...recurringData,
        id: `recur-${Date.now()}`,
    };
    recurring.push(newRecurring);
    revalidatePath('/recurring');
    revalidatePath('/dashboard');
    return { success: true, recurring: newRecurring };
}

export async function updateRecurring(id: string, recurringData: Partial<Recurring>) {
    await delay(500);
    const index = recurring.findIndex(r => r.id === id);
    if (index !== -1) {
        recurring[index] = { ...recurring[index], ...recurringData };
        revalidatePath('/recurring');
        revalidatePath('/dashboard');
        return { success: true, recurring: recurring[index] };
    }
    return { success: false, message: 'Recurring transaction not found' };
}

export async function deleteRecurring(id: string) {
    await delay(500);
    recurring = recurring.filter(r => r.id !== id);
    revalidatePath('/recurring');
    revalidatePath('/dashboard');
    return { success: true };
}


export async function importTransactions(data: any[]) {
    await delay(1000);
    let count = 0;
    for (const row of data) {
        if (!row.Date || !row.Description || !row.Amount || !row.Category) continue;

        const newTransaction: Transaction = {
            id: `trans-${Date.now()}-${Math.random()}`,
            date: new Date(row.Date).toISOString(),
            description: row.Description,
            amount: parseFloat(row.Amount),
            type: parseFloat(row.Amount) >= 0 ? 'income' : 'expense',
            category: row.Category,
        };

        if (newTransaction.type === 'expense') {
            const goalIndex = goals.findIndex(g => getGoalKeyword(g.name) === newTransaction.category);
            if (goalIndex !== -1) {
                goals[goalIndex].currentAmount += newTransaction.amount;
            }
        }
        
        transactions.unshift(newTransaction);
        count++;
    }
    
    if (count > 0) {
      revalidatePath('/transactions');
      revalidatePath('/dashboard');
      revalidatePath('/goals');
    }

    return { success: true, count };
}
