import { createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { useDashboardStats } from '@/hooks/queries/use-dashboard';
import { useTickets } from '@/hooks/queries/use-tickets';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentTickets, isLoading: ticketsLoading } = useTickets({ limit: 5 });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening today</p>
        </div>
        {user?.role === 'tenant' && (
          <Link to="/dashboard/tickets/new">
            <Button className="h-12 px-6">
              <span className="mr-2">➕</span>
              Report Issue
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Open"
            value={stats?.open || 0}
            color="bg-blue-500"
            icon="📋"
          />
          <StatCard
            label="Assigned"
            value={stats?.assigned || 0}
            color="bg-yellow-500"
            icon="👤"
          />
          <StatCard
            label="In Progress"
            value={stats?.inProgress || 0}
            color="bg-purple-500"
            icon="🔧"
          />
          <StatCard
            label="Urgent"
            value={stats?.urgent || 0}
            color="bg-red-500"
            icon="⚠️"
          />
        </div>
      )}

      {/* Recent Tickets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Tickets</h2>
          <Link to="/dashboard/tickets">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {ticketsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentTickets?.data?.length ? (
          <div className="space-y-4">
            {recentTickets.data.slice(0, 5).map((ticket) => (
              <Link
                key={ticket.id}
                to="/dashboard/tickets/$ticketId"
                params={{ ticketId: ticket.id }}
                className="block"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            ticket.status === 'open'
                              ? 'bg-blue-100 text-blue-700'
                              : ticket.status === 'assigned'
                                ? 'bg-yellow-100 text-yellow-700'
                                : ticket.status === 'in_progress'
                                  ? 'bg-purple-100 text-purple-700'
                                  : ticket.status === 'resolved'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            ticket.priority === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : ticket.priority === 'high'
                                ? 'bg-orange-100 text-orange-700'
                                : ticket.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {ticket.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {ticket.unit || 'No unit'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No tickets yet</p>
            {user?.role === 'tenant' && (
              <Link to="/dashboard/tickets/new">
                <Button className="mt-4">Report First Issue</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  icon: string;
}

function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <div className={`w-3 h-3 rounded-full ${color}`} />
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}
