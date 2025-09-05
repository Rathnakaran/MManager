
import GoalsClient from '@/components/pages/goals/goals-client';

export default async function GoalsPage() {
  // This page is client-side rendered now to access localStorage
  return <GoalsClient />;
}
