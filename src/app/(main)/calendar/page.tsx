
import CalendarClient from '@/components/pages/calendar/calendar-client';
import { getTransactions, getUserIdFromCookie } from '@/lib/actions';
import { notFound } from 'next/navigation';

export default async function CalendarPage() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    notFound();
  }

  const transactions = await getTransactions(userId);

  return <CalendarClient initialTransactions={transactions} />;
}
