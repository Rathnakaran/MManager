
'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import type { Transaction, Budget, Goal, RecurringTransaction } from '@/types';
import { sampleTransactions, sampleBudgets, sampleGoals, sampleRecurringTransactions } from './seed-data';


const getGoalKeyword = (goalName: string) => {
    return goalName.split(' ')[0];
}

// --- Seeding ---
async function seedDatabase() {
    const batch = writeBatch(db);
    const transactionsCollection = collection(db, 'transactions');
    const budgetsCollection = collection(db, 'budgets');
    const goalsCollection = collection(db, 'goals');
    const recurringCollection = collection(db, 'recurring');

    const transactionsSnapshot = await getDocs(transactionsCollection);
    if (transactionsSnapshot.empty) {
        console.log('Seeding transactions...');
        sampleTransactions.forEach(t => {
            const docRef = doc(transactionsCollection);
            batch.set(docRef, t);
        });
    }

    const budgetsSnapshot = await getDocs(budgetsCollection);
    if (budgetsSnapshot.empty) {
        console.log('Seeding budgets...');
        sampleBudgets.forEach(b => {
            const docRef = doc(budgetsCollection);
            batch.set(docRef, b);
        });
    }

    const goalsSnapshot = await getDocs(goalsCollection);
    if (goalsSnapshot.empty) {
        console.log('Seeding goals...');
        sampleGoals.forEach(g => {
            const docRef = doc(goalsCollection);
            batch.set(docRef, g);
        });
    }

    const recurringSnapshot = await getDocs(recurringCollection);
    if (recurringSnapshot.empty) {
        console.log('Seeding recurring transactions...');
        sampleRecurringTransactions.forEach(r => {
            const docRef = doc(recurringCollection);
            batch.set(docRef, r);
        });
    }
    
    await batch.commit();
}


// --- Data Fetching ---
export async function getData() {
  await seedDatabase();
  const [transactions, budgets, goals] = await Promise.all([
    getTransactions(),
    getBudgets(),
    getGoals(),
  ]);
  return { transactions, budgets, goals };
}

export async function getTransactions(): Promise<Transaction[]> {
  const transactionsCollection = collection(db, 'transactions');
  const q = query(transactionsCollection, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
}

export async function getBudgets(): Promise<Budget[]> {
  const budgetsCollection = collection(db, 'budgets');
  const snapshot = await getDocs(budgetsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
}

export async function getBudgetCategories(): Promise<string[]> {
    const budgetsCollection = collection(db, 'budgets');
    const snapshot = await getDocs(budgetsCollection);
    return snapshot.docs.map(doc => doc.data().category as string);
}

// --- Transaction Actions ---
export async function addTransaction(transactionData: Omit<Transaction, 'id'>) {
  const newTransactionRef = await addDoc(collection(db, 'transactions'), transactionData);
  
  // Check if the transaction category is a goal contribution
  const goals = await getGoals();
  const goal = goals.find(g => getGoalKeyword(g.name) === transactionData.category);

  if (transactionData.type === 'expense' && goal) {
      const goalRef = doc(db, 'goals', goal.id);
      await updateDoc(goalRef, {
          currentAmount: goal.currentAmount + transactionData.amount
      });
      revalidatePath('/goals');
  }

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  return { success: true, transaction: { id: newTransactionRef.id, ...transactionData } };
}

export async function updateTransaction(id: string, transactionData: Partial<Transaction>) {
  const transactionRef = doc(db, 'transactions', id);
  await updateDoc(transactionRef, transactionData);
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/goals');
  return { success: true, transaction: { id, ...transactionData } };
}

export async function deleteTransaction(id: string) {
  const transactionRef = doc(db, 'transactions', id);
  await deleteDoc(transactionRef);
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/goals');
  return { success: true };
}


// --- Budget Actions ---
export async function addBudget(budgetData: Omit<Budget, 'id'>) {
    const newBudgetRef = await addDoc(collection(db, 'budgets'), budgetData);
    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true, budget: { id: newBudgetRef.id, ...budgetData } };
}

export async function updateBudget(id: string, budgetData: Partial<Budget>) {
    const budgetRef = doc(db, 'budgets', id);
    await updateDoc(budgetRef, budgetData);
    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true, budget: {id, ...budgetData} };
}

export async function deleteBudget(id: string) {
    const budgetRef = doc(db, 'budgets', id);
    await deleteDoc(budgetRef);
    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true };
}

// --- Goal Actions ---
export async function getGoals(): Promise<Goal[]> {
  const goalsCollection = collection(db, 'goals');
  const snapshot = await getDocs(goalsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
}

export async function getGoalCategories(): Promise<string[]> {
    const goalsCollection = collection(db, 'goals');
    const snapshot = await getDocs(goalsCollection);
    return snapshot.docs.map(doc => getGoalKeyword(doc.data().name as string));
}

export async function addGoal(goalData: Omit<Goal, 'id'>) {
  const newGoalRef = await addDoc(collection(db, 'goals'), goalData);
  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true, goal: { id: newGoalRef.id, ...goalData } };
}

export async function updateGoal(id: string, goalData: Partial<Goal>) {
  const goalRef = doc(db, 'goals', id);
  await updateDoc(goalRef, goalData);
  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true, goal: {id, ...goalData} };
}

export async function deleteGoal(id: string) {
  const goalRef = doc(db, 'goals', id);
  await deleteDoc(goalRef);
  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function importTransactions(data: any[]) {
    const batch = writeBatch(db);
    const transactionsCollection = collection(db, 'transactions');
    let count = 0;

    const goals = await getGoals();

    for (const row of data) {
        if (!row.Date || !row.Description || !row.Amount || !row.Category) continue;

        const amount = parseFloat(row.Amount);
        const type = amount >= 0 ? 'income' : 'expense';

        const newTransaction = {
            date: new Date(row.Date).toISOString(),
            description: row.Description,
            amount: Math.abs(amount),
            type: type,
            category: row.Category,
        };
        
        const docRef = doc(transactionsCollection);
        batch.set(docRef, newTransaction);
        
        if (newTransaction.type === 'expense') {
            const goal = goals.find(g => getGoalKeyword(g.name) === newTransaction.category);
            if (goal) {
                const goalRef = doc(db, 'goals', goal.id);
                const newCurrentAmount = goal.currentAmount + newTransaction.amount;
                batch.update(goalRef, { currentAmount: newCurrentAmount });
                // Update goal in local array to handle multiple contributions to same goal in one import
                goal.currentAmount = newCurrentAmount;
            }
        }
        
        count++;
    }
    
    if (count > 0) {
      await batch.commit();
      revalidatePath('/transactions');
      revalidatePath('/dashboard');
      revalidatePath('/goals');
    }

    return { success: true, count };
}


// --- Recurring Transaction Actions ---
export async function getRecurringTransactions(): Promise<RecurringTransaction[]> {
  const recurringCollection = collection(db, 'recurring');
  const snapshot = await getDocs(recurringCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecurringTransaction));
}

export async function addRecurringTransaction(recTransactionData: Omit<RecurringTransaction, 'id'>) {
    const newRecRef = await addDoc(collection(db, 'recurring'), recTransactionData);
    revalidatePath('/recurring');
    return { success: true, transaction: {id: newRecRef.id, ...recTransactionData} };
}

export async function updateRecurringTransaction(id: string, recTransactionData: Partial<RecurringTransaction>) {
    const recRef = doc(db, 'recurring', id);
    await updateDoc(recRef, recTransactionData);
    revalidatePath('/recurring');
    return { success: true, transaction: {id, ...recTransactionData} };
}

export async function deleteRecurringTransaction(id: string) {
    const recRef = doc(db, 'recurring', id);
    await deleteDoc(recRef);
    revalidatePath('/recurring');
    return { success: true };
}
