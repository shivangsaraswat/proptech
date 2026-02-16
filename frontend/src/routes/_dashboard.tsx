import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayoutRoute,
});

function DashboardLayoutRoute() {
  const { isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
