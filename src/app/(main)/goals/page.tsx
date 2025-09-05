
import GoalsClient from '@/components/pages/goals/goals-client';
import { getGoals, getUserIdFromCookie } from '@/lib/actions';
import { notFound } from 'next/navigation';

export default async function GoalsPage() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    notFound();
  }

  const goals = await getGoals(userId);

  return <GoalsClient initialGoals={goals} />;
}
