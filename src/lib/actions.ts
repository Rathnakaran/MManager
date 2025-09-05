
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
  getDoc,
  where,
} from 'firebase/firestore';
import type { Transaction, Budget, Goal, RecurringTransaction, User } from '@/types';
import { cookies } from 'next/headers';


export async function getUserIdFromCookie() {
    const cookieStore = cookies();
    const userIdCookie = cookieStore.get('loggedInUserId');
    return userIdCookie?.value;
}


const getGoalKeyword = (goalName: string) => {
    return goalName.split(' ')[0];
}

// --- User Actions ---
export async function createUser(userData: Omit<User, 'id'>) {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('username', '==', userData.username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        throw new Error('Username already exists');
    }
    
    const newDocRef = await addDoc(usersCollection, userData);
    const newUser = { id: newDocRef.id, ...userData };

    await seedInitialData(newUser.id);

    revalidatePath('/settings');
    return newUser;
}

export async function getUserById(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        return null;
    }
    return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function getUserByUsername(username: string, password?: string): Promise<User | null> {
    const usersCollection = collection(db, 'users');
    let q;
    if (password) {
        q = query(usersCollection, where('username', '==', username), where('password', '==', password));
    } else {
        q = query(usersCollection, where('username', '==', username));
    }
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    return { id: userDoc.id, ...userData } as User;
}

export async function getUsers(): Promise<User[]> {
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data } as User;
    });
}

export async function updateUser(userId: string, userData: Partial<Pick<User, 'name' | 'email' | 'dateOfBirth' | 'photoURL'>>) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, userData);
    revalidatePath('/settings');
    revalidatePath('/(main)/layout');
    return { success: true };
}

export async function updateUserPassword(userId: string, newPassword: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { password: newPassword });
    revalidatePath('/settings');
    return { success: true };
}

export async function deleteUser(userIdToDelete: string) {
    const batch = writeBatch(db);

    // 1. Delete the user document
    const userRef = doc(db, 'users', userIdToDelete);
    batch.delete(userRef);

    // 2. Delete all associated data
    const collectionsToDelete = ['transactions', 'budgets', 'goals', 'recurring'];
    for (const collectionName of collectionsToDelete) {
        const q = query(collection(db, collectionName), where('userId', '==', userIdToDelete));
        const snapshot = await getDocs(q);
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
    }

    await batch.commit();
    revalidatePath('/settings');
    return { success: true };
}


// --- Data Fetching ---
export async function getData(userId: string) {
  const [transactions, budgets, goals, recurringTransactions] = await Promise.all([
    getTransactions(userId),
    getBudgets(userId),
    getGoals(userId),
    getRecurringTransactions(userId),
  ]);
  return { transactions, budgets, goals, recurringTransactions };
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  if (!userId) return [];
  const q = query(collection(db, 'transactions'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
}

export async function getBudgets(userId: string): Promise<Budget[]> {
  const q = query(collection(db, 'budgets'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
}

export async function getBudgetCategories(userId: string): Promise<string[]> {
    const budgets = await getBudgets(userId);
    // All sample budgets removed as per user request.
    return budgets.map(b => b.category);
}

// --- Transaction Actions ---
export async function addTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
  const newDocRef = await addDoc(collection(db, 'transactions'), transactionData);
  const newTransaction = { id: newDocRef.id, ...transactionData };

  const goals = await getGoals(transactionData.userId);
  const goal = goals.find(g => getGoalKeyword(g.name) === transactionData.category);

  if (transactionData.type === 'expense' && goal) {
      const goalRef = doc(db, 'goals', goal.id);
      await updateDoc(goalRef, {
          currentAmount: goal.currentAmount + transactionData.amount
      });
  }

  revalidatePath('/');
  return newTransaction;
}

export async function updateTransaction(id: string, transactionData: Partial<Omit<Transaction, 'id'>>): Promise<Transaction> {
  const transactionRef = doc(db, 'transactions', id);
  await updateDoc(transactionRef, transactionData);
  revalidatePath('/');
  
  const updatedDoc = await getDoc(transactionRef);
  return { id: updatedDoc.id, ...updatedDoc.data() } as Transaction;
}

export async function deleteTransaction(id: string) {
  const transactionRef = doc(db, 'transactions', id);
  await deleteDoc(transactionRef);
  revalidatePath('/');
}


// --- Budget Actions ---
export async function addBudget(budgetData: Omit<Budget, 'id'>): Promise<Budget> {
    const newDocRef = await addDoc(collection(db, 'budgets'), budgetData);
    revalidatePath('/');
    const newBudget = { id: newDocRef.id, ...budgetData };
    return newBudget;
}

export async function updateBudget(id: string, budgetData: Partial<Omit<Budget, 'id'>>): Promise<Budget> {
    const budgetRef = doc(db, 'budgets', id);
    await updateDoc(budgetRef, budgetData);
    revalidatePath('/');
    const updatedDoc = await getDoc(budgetRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Budget;
}

export async function deleteBudget(id: string) {
    const budgetRef = doc(db, 'budgets', id);
    await deleteDoc(budgetRef);
    revalidatePath('/');
}

// --- Goal Actions ---
export async function getGoals(userId: string): Promise<Goal[]> {
  const q = query(collection(db, 'goals'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
}

export async function getGoalCategories(userId: string): Promise<string[]> {
    const goals = await getGoals(userId);
    return goals.map(doc => getGoalKeyword(doc.name as string));
}

export async function addGoal(goalData: Omit<Goal, 'id'>): Promise<Goal> {
  const newGoalRef = await addDoc(collection(db, 'goals'), goalData);
  revalidatePath('/');
  const newGoal = { id: newGoalRef.id, ...goalData };
  return newGoal;
}

export async function updateGoal(id: string, goalData: Partial<Goal>): Promise<Goal> {
  const goalRef = doc(db, 'goals', id);
  await updateDoc(goalRef, goalData);
  revalidatePath('/');
  const updatedDoc = await getDoc(goalRef);
  return { id: updatedDoc.id, ...updatedDoc.data() } as Goal;
}

export async function deleteGoal(id: string) {
  const goalRef = doc(db, 'goals', id);
  await deleteDoc(goalRef);
  revalidatePath('/');
  return { success: true };
}

export async function importTransactions(userId: string, data: any[]): Promise<Transaction[]> {
    const batch = writeBatch(db);
    const transactionsCollection = collection(db, 'transactions');
    const newTransactions: Transaction[] = [];

    const goals = await getGoals(userId);

    for (const row of data) {
        if (!row.Date || !row.Description || !row.Amount || !row.Category) continue;

        const amount = parseFloat(row.Amount);
        const type = parseFloat(row.Amount) >= 0 ? 'income' : 'expense';

        const transactionData: Omit<Transaction, 'id'> = {
            userId,
            date: new Date(row.Date).toISOString(),
            description: row.Description,
            amount: Math.abs(amount),
            type: type,
            category: row.Category,
        };
        
        const docRef = doc(transactionsCollection);
        batch.set(docRef, transactionData);
        newTransactions.push({ id: docRef.id, ...transactionData });
        
        if (transactionData.type === 'expense') {
            const goal = goals.find(g => getGoalKeyword(g.name) === transactionData.category);
            if (goal) {
                const goalRef = doc(db, 'goals', goal.id);
                const newCurrentAmount = goal.currentAmount + transactionData.amount;
                batch.update(goalRef, { currentAmount: newCurrentAmount });
                goal.currentAmount = newCurrentAmount;
            }
        }
    }
    
    if (newTransactions.length > 0) {
      await batch.commit();
      revalidatePath('/');
    }

    return newTransactions;
}


// --- Recurring Transaction Actions ---
export async function getRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
  const q = query(collection(db, 'recurring'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecurringTransaction));
}

export async function addRecurringTransaction(recTransactionData: Omit<RecurringTransaction, 'id'>): Promise<RecurringTransaction> {
    const newRecRef = await addDoc(collection(db, 'recurring'), recTransactionData);
    revalidatePath('/recurring');
    return {id: newRecRef.id, ...recTransactionData};
}

export async function updateRecurringTransaction(id: string, recTransactionData: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    const recRef = doc(db, 'recurring', id);
    await updateDoc(recRef, recTransactionData);
    revalidatePath('/recurring');
    const updatedDoc = await getDoc(recRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as RecurringTransaction;
}

export async function deleteRecurringTransaction(id: string) {
    const recRef = doc(db, 'recurring', id);
    await deleteDoc(recRef);
    revalidatePath('/recurring');
    return { success: true };
}


// --- Seeding ---
export async function seedInitialData(userId: string) {
  // This function is now empty to ensure new users start with a clean slate.
  console.log(`New user created with ID: ${userId}. No sample data seeded.`);
}
