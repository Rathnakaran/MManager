import type { Transaction, Budget, Goal, Recurring } from '@/types';

const today = new Date();
const currentMonth = today.toISOString().slice(0, 7);

export const sampleBudgets: Omit<Budget, 'id'>[] = [
  { category: 'Home Loan EMI', amount: 1200, icon: 'Home' },
  { category: 'Credit Card Loan', amount: 500, icon: 'CreditCard' },
  { category: 'Shopping', amount: 300, icon: 'ShoppingBag' },
  { category: 'Investments', amount: 1000, icon: 'PiggyBank' },
  { category: 'Family Support', amount: 400, icon: 'Users' },
  { category: 'Donation', amount: 100, icon: 'Heart' },
  { category: 'House Rent', amount: 800, icon: 'Home' },
  { category: 'Essentials', amount: 250, icon: 'ShoppingCart' },
  { category: 'Hometown Travel', amount: 150, icon: 'Plane' },
  { category: 'Outside Food', amount: 200, icon: 'Utensils' },
  { category: 'Trips & Moi', amount: 300, icon: 'Gift' },
  { category: 'Local Transport', amount: 100, icon: 'Car' },
  { category: 'Medical', amount: 100, icon: 'HeartPulse' },
  { category: 'Lifestyle', amount: 150, icon: 'Briefcase' },
  { category: 'Others/Unexpected', amount: 200, icon: 'Receipt' },
];

export const sampleTransactions: Omit<Transaction, 'id'>[] = [
  { date: `${currentMonth}-02`, description: "Trader Joe's", amount: 125.50, type: 'expense', category: 'Essentials' },
  { date: `${currentMonth}-03`, description: "Monthly Salary", amount: 6000, type: 'income', category: 'Salary' },
  { date: `${currentMonth}-05`, description: 'Rent Payment', amount: 800, type: 'expense', category: 'House Rent' },
  { date: `${currentMonth}-07`, description: 'Dinner with friends', amount: 85.00, type: 'expense', category: 'Outside Food' },
  { date: `${currentMonth}-10`, description: 'Movie tickets', amount: 30.00, type: 'expense', category: 'Lifestyle' },
  { date: `${currentMonth}-12`, description: 'Uber ride', amount: 22.45, type: 'expense', category: 'Local Transport' },
  { date: `${currentMonth}-15`, description: 'H&M', amount: 95.80, type: 'expense', category: 'Shopping' },
  { date: `${currentMonth}-18`, description: 'Pharmacy', amount: 45.00, type: 'expense', category: 'Medical' },
  { date: `${currentMonth}-20`, description: 'Groceries', amount: 92.30, type: 'expense', category: 'Essentials' },
  { date: `${currentMonth}-21`, description: 'Home Loan EMI', amount: 1200, type: 'expense', category: 'Home Loan EMI' },
  { date: `${currentMonth}-22`, description: 'Donation to Charity', amount: 100, type: 'expense', category: 'Donation' },
];

export const sampleGoals: Omit<Goal, 'id'>[] = [
  { name: 'Vacation to Hawaii', targetAmount: 5000, currentAmount: 1200, targetDate: new Date(today.getFullYear() + 1, 5, 1).toISOString() },
  { name: 'New Laptop', targetAmount: 2000, currentAmount: 1800, targetDate: new Date(today.getFullYear(), today.getMonth() + 2, 1).toISOString() },
  { name: 'Emergency Fund', targetAmount: 10000, currentAmount: 6500, targetDate: new Date(today.getFullYear() + 2, 0, 1).toISOString() },
];

export const sampleRecurring: Omit<Recurring, 'id'>[] = [
    { description: 'Monthly Salary', amount: 6000, type: 'income', category: 'Salary', frequency: 'monthly', startDate: `${today.getFullYear()}-01-01` },
    { description: 'Netflix Subscription', amount: 15.99, type: 'expense', category: 'Lifestyle', frequency: 'monthly', startDate: `${today.getFullYear()}-01-01` },
    { description: 'Gym Membership', amount: 40.00, type: 'expense', category: 'Lifestyle', frequency: 'monthly', startDate: `${today.getFullYear()}-01-01` },
];

export const getBudgetCategories = () => sampleBudgets.map(b => b.category);
