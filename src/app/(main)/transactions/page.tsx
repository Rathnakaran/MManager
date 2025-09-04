import { getTransactions, getBudgetCategories } from '@/lib/actions';
import TransactionsClient from '@/components/pages/transactions/transactions-client';

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  const categories = await getBudgetCategories();

  return <TransactionsClient initialTransactions={transactions} categories={categories} />;
}
