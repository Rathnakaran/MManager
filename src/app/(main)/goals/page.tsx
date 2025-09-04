import { getGoals } from '@/lib/actions';
import GoalsClient from '@/components/pages/goals/goals-client';

export default async function GoalsPage() {
  const goals = await getGoals();
  return <GoalsClient initialGoals={goals} />;
}
