
import BudgetsClient from '@/components/pages/budgets/budgets-client';
import { getBudgets, getTransactions, getUserIdFromCookie } from '@/lib/actions';
import { notFound } from 'next/navigation';

export default async function BudgetsPage() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    notFound();
  }

  const [budgets, transactions] = await Promise.all([
    getBudgets(userId),
    getTransactions(userId),
  ]);

  return <BudgetsClient initialBudgets={budgets} initialTransactions={transactions} />;
}
