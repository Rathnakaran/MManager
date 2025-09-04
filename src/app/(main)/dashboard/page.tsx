import { getData } from '@/lib/actions';
import DashboardClient from '@/components/pages/dashboard/dashboard-client';

export default async function DashboardPage() {
  const { transactions, budgets, goals } = await getData();

  return <DashboardClient transactions={transactions} budgets={budgets} goals={goals} />;
}
