
import { getBudgets, getTransactions } from '@/lib/actions';
import BudgetsClient from '@/components/pages/budgets/budgets-client';

export default async function BudgetsPage() {
  // This page is client-side rendered now to access localStorage
  return <BudgetsClient />;
}
