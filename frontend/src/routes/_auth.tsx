import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/_auth')({
  component: AuthLayoutRoute,
});

function AuthLayoutRoute() {
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
