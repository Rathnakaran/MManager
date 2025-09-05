
import RecurringClient from '@/components/pages/recurring/recurring-client';
import { getBudgetCategories, getRecurringTransactions, getUserIdFromCookie } from '@/lib/actions';
import { notFound } from 'next/navigation';


export default async function RecurringPage() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    notFound();
  }

  const [recurringTransactions, categories] = await Promise.all([
    getRecurringTransactions(userId),
    getBudgetCategories(userId),
  ]);

  return <RecurringClient initialRecurring={recurringTransactions} initialCategories={categories} />;
}
