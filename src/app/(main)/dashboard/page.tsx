
import DashboardClient from '@/components/pages/dashboard/dashboard-client';
import { getData, getUserIdFromCookie } from '@/lib/actions';
import { notFound } from 'next/navigation';

export default async function DashboardPage() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    notFound();
  }

  const { transactions, budgets, goals, recurringTransactions } = await getData(userId);

  return (
    <DashboardClient
      transactions={transactions}
      budgets={budgets}
      goals={goals}
      recurringTransactions={recurringTransactions}
    />
  );
}
