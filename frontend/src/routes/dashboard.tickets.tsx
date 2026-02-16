import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/tickets')({
  component: TicketsLayout,
});

function TicketsLayout() {
  return <Outlet />;
}
