import type { Transaction, Budget, Goal, Recurring } from '@/types';

const today = new Date();
const currentMonth = today.toISOString().slice(0, 7);

export const sampleBudgets: Omit<Budget, 'id'>[] = [
  { category: 'Groceries', amount: 500, icon: 'ShoppingCart' },
  { category: 'Dining Out', amount: 200, icon: 'Utensils' },
  { category: 'Transport', amount: 150, icon: 'Car' },
  { category: 'Utilities', amount: 250, icon: 'Home' },
  { category: 'Entertainment', amount: 100, icon: 'Ticket' },
  { category: 'Health', amount: 80, icon: 'HeartPulse' },
  { category: 'Shopping', amount: 120, icon: 'ShoppingBag' },
];

export const sampleTransactions: Omit<Transaction, 'id'>[] = [
  { date: `${currentMonth}-02`, description: "Trader Joe's", amount: 125.50, type: 'expense', category: 'Groceries' },
  { date: `${currentMonth}-03`, description: "Monthly Salary", amount: 4000, type: 'income', category: 'Salary' },
  { date: `${currentMonth}-05`, description: 'Gas Bill', amount: 75.20, type: 'expense', category: 'Utilities' },
  { date: `${currentMonth}-07`, description: 'Dinner with friends', amount: 85.00, type: 'expense', category: 'Dining Out' },
  { date: `${currentMonth}-10`, description: 'Movie tickets', amount: 30.00, type: 'expense', category: 'Entertainment' },
  { date: `${currentMonth}-12`, description: 'Uber ride', amount: 22.45, type: 'expense', category: 'Transport' },
  { date: `${currentMonth}-15`, description: 'Zara', amount: 95.80, type: 'expense', category: 'Shopping' },
  { date: `${currentMonth}-18`, description: 'Pharmacy', amount: 45.00, type: 'expense', category: 'Health' },
  { date: `${currentMonth}-20`, description: 'Whole Foods', amount: 92.30, type: 'expense', category: 'Groceries' },
];

export const sampleGoals: Omit<Goal, 'id'>[] = [
  { name: 'Vacation to Hawaii', targetAmount: 5000, currentAmount: 1200, targetDate: new Date(today.getFullYear() + 1, 5, 1).toISOString() },
  { name: 'New Laptop', targetAmount: 2000, currentAmount: 1800, targetDate: new Date(today.getFullYear(), today.getMonth() + 2, 1).toISOString() },
  { name: 'Emergency Fund', targetAmount: 10000, currentAmount: 6500, targetDate: new Date(today.getFullYear() + 2, 0, 1).toISOString() },
];

export const sampleRecurring: Omit<Recurring, 'id'>[] = [
    { description: 'Monthly Salary', amount: 4000, type: 'income', category: 'Salary', frequency: 'monthly', startDate: `${today.getFullYear()}-01-01` },
    { description: 'Netflix Subscription', amount: 15.99, type: 'expense', category: 'Entertainment', frequency: 'monthly', startDate: `${today.getFullYear()}-01-01` },
    { description: 'Gym Membership', amount: 40.00, type: 'expense', category: 'Health', frequency: 'monthly', startDate: `${today.getFullYear()}-01-01` },
];

export const getBudgetCategories = () => sampleBudgets.map(b => b.category);
