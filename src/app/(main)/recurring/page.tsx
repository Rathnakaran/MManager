import { getRecurring, getBudgetCategories } from '@/lib/actions';
import RecurringClient from '@/components/pages/recurring/recurring-client';

export default async function RecurringPage() {
  const recurring = await getRecurring();
  const categories = await getBudgetCategories();

  return <RecurringClient initialRecurring={recurring} categories={categories} />;
}
