
import { getRecurringTransactions, getBudgetCategories } from '@/lib/actions';
import RecurringClient from '@/components/pages/recurring/recurring-client';

export default async function RecurringPage() {
  const recurring = await getRecurringTransactions();
  const budgetCategories = await getBudgetCategories();

  return <RecurringClient initialRecurringTransactions={recurring} categories={budgetCategories} />;
}
