
import { getTransactions, getBudgetCategories, getGoalCategories } from '@/lib/actions';
import TransactionsClient from '@/components/pages/transactions/transactions-client';

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  const budgetCategories = await getBudgetCategories();
  const goalCategories = await getGoalCategories();

  return <TransactionsClient initialTransactions={transactions} categories={{ budgetCategories, goalCategories }} />;
}
