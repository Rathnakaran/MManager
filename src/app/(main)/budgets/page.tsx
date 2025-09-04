import { getBudgets } from '@/lib/actions';
import BudgetsClient from '@/components/pages/budgets/budgets-client';

export default async function BudgetsPage() {
  const budgets = await getBudgets();

  return <BudgetsClient initialBudgets={budgets} />;
}
