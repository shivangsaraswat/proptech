import { Navigate, createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const { isAuthenticated } = useAuthStore();

  // Redirect based on auth status
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <Navigate to="/login" />;
}