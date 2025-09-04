
export interface Transaction {
  id: string;
  date: string; // ISO 8601 format
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  icon: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO 8601 format
}

export interface RecurringTransaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'Monthly' | 'Weekly' | 'Yearly';
  dayOfWeek?: string; // e.g., 'Monday'
  dayOfMonth?: number; // 1-31
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  password?: string; // Should be hashed
  dateOfBirth: string; // ISO 8601 format
}
