
import DashboardClient from '@/components/pages/dashboard/dashboard-client';

export default async function DashboardPage() {
  // This page is client-side rendered now to access localStorage
  return <DashboardClient />;
}
