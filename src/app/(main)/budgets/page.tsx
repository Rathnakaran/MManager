import { getBudgets, getTransactions } from '@/lib/actions';
import BudgetsClient from '@/components/pages/budgets/budgets-client';

export default async function BudgetsPage() {
  const budgets = await getBudgets();
  const transactions = await getTransactions();

  return <BudgetsClient initialBudgets={budgets} initialTransactions={transactions} />;
}
