
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

export interface Recurring {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'monthly' | 'yearly';
  startDate: string; // ISO 8601 format
}
