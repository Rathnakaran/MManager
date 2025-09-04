
import { getTransactions, getBudgetCategories, getGoalCategories } from '@/lib/actions';
import TransactionsClient from '@/components/pages/transactions/transactions-client';

export default async function TransactionsPage() {
  const [transactions, budgetCategories, goalCategories] = await Promise.all([
    getTransactions(),
    getBudgetCategories(),
    getGoalCategories()
  ]);

  return <TransactionsClient initialTransactions={transactions} categories={{ budgetCategories, goalCategories }} />;
}
