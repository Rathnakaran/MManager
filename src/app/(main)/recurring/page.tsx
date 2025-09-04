
import { getRecurring, getBudgetCategories, getGoalCategories } from '@/lib/actions';
import RecurringClient from '@/components/pages/recurring/recurring-client';

export default async function RecurringPage() {
  const recurring = await getRecurring();
  const budgetCategories = await getBudgetCategories();
  const goalCategories = await getGoalCategories();

  return <RecurringClient initialRecurring={recurring} categories={{ budgetCategories, goalCategories}} />;
}
