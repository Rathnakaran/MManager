
import { getBudgets, getTransactions } from '@/lib/actions';
import BudgetsClient from '@/components/pages/budgets/budgets-client';

export default async function BudgetsPage() {
  const [budgets, transactions] = await Promise.all([
    getBudgets(),
    getTransactions()
  ]);

  return <BudgetsClient initialBudgets={budgets} initialTransactions={transactions} />;
}
