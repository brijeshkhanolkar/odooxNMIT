import { requireAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAuth();

  return <DashboardLayout profile={profile}>{children}</DashboardLayout>;
}
