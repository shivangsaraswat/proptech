import { Navigate, createFileRoute, Outlet } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayoutRoute,
});

function DashboardLayoutRoute() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
