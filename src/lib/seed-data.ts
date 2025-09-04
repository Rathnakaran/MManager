import type { Transaction, Budget, Goal } from '@/types';

const today = new Date();
const currentMonth = today.toISOString().slice(0, 7);

export const sampleBudgets: Omit<Budget, 'id'>[] = [
  { category: 'Groceries', amount: 400, icon: 'ShoppingCart' },
  { category: 'Dining Out', amount: 250, icon: 'Utensils' },
  { category: 'Transportation', amount: 150, icon: 'Car' },
  { category: 'Rent/Mortgage', amount: 1500, icon: 'Home' },
  { category: 'Entertainment', amount: 100, icon: 'Ticket' },
  { category: 'Health', amount: 200, icon: 'HeartPulse' },
  { category: 'Apparel', amount: 150, icon: 'ShoppingBag' },
  { category: 'Bills & Utilities', amount: 200, icon: 'Receipt' },
  { category: 'Personal Care', amount: 75, icon: 'Heart' },
  { category: 'Gifts & Donations', amount: 50, icon: 'Gift' },
  { category: 'Travel', amount: 300, icon: 'Plane' },
  { category: 'Education', amount: 100, icon: 'Briefcase' },
  { category: 'Kids', amount: 200, icon: 'Users' },
  { category: 'Pets', amount: 75, icon: 'Dog' },
  { category: 'Investments', amount: 500, icon: 'PiggyBank' },
  { category: 'Miscellaneous', amount: 100, icon: 'CircleDollarSign' },
];

export const sampleTransactions: Omit<Transaction, 'id'>[] = [
  { date: `${currentMonth}-02`, description: "BigBasket", amount: 3500, type: 'expense', category: 'Groceries' },
  { date: `${currentMonth}-03`, description: "Monthly Salary", amount: 75000, type: 'income', category: 'Salary' },
  { date: `${currentMonth}-05`, description: 'House Rent', amount: 20000, type: 'expense', category: 'Rent/Mortgage' },
  { date: `${currentMonth}-07`, description: 'Dinner at Anjappar', amount: 1200, type: 'expense', category: 'Dining Out' },
  { date: `${currentMonth}-10`, description: 'LEO movie tickets', amount: 500, type: 'expense', category: 'Entertainment' },
  { date: `${currentMonth}-12`, description: 'Ola ride to office', amount: 250, type: 'expense', category: 'Transportation' },
  { date: `${currentMonth}-15`, description: 'Nalli Silks', amount: 4500, type: 'expense', category: 'Apparel' },
  { date: `${currentMonth}-18`, description: 'Apollo Pharmacy', amount: 750, type: 'expense', category: 'Health' },
  { date: `${currentMonth}-20`, description: 'More Groceries', amount: 1500, type: 'expense', category: 'Groceries' },
  { date: `${currentMonth}-21`, description: 'Electricity Bill', amount: 800, type: 'expense', category: 'Bills & Utilities' },
  { date: `${currentMonth}-22`, description: 'Donation to temple', amount: 501, type: 'expense', category: 'Gifts & Donations' },
];

export const sampleGoals: Omit<Goal, 'id'>[] = [
  { name: 'Goa Trip with friends', targetAmount: 40000, currentAmount: 15000, targetDate: new Date(today.getFullYear(), today.getMonth() + 6, 1).toISOString() },
  { name: 'New iPhone 15', targetAmount: 80000, currentAmount: 25000, targetDate: new Date(today.getFullYear(), today.getMonth() + 4, 1).toISOString() },
  { name: 'Emergency Fund', targetAmount: 100000, currentAmount: 65000, targetDate: new Date(today.getFullYear() + 1, 0, 1).toISOString() },
];

export const getBudgetCategories = () => sampleBudgets.map(b => b.category);
