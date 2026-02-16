import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useDashboardStats } from '@/hooks/queries/use-dashboard';
import { useTickets } from '@/hooks/queries/use-tickets';
import { Button } from '@/components/ui/button';
import { CreateTicketDialog } from '@/components/tickets/create-ticket-dialog';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndexPage,
});

function DashboardIndexPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role;
  const [createOpen, setCreateOpen] = useState(false);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentTickets, isLoading: ticketsLoading } = useTickets({
    limit: 5,
  });

  const subtitle =
    role === 'manager'
      ? 'Overview of all maintenance operations'
      : role === 'technician'
        ? 'Your assigned tasks at a glance'
        : "Here's what's happening with your requests";

  const recentTitle =
    role === 'manager'
      ? 'Recent Tickets (All)'
      : role === 'technician'
        ? 'My Assigned Tasks'
        : 'My Recent Requests';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
        {(role === 'tenant' || role === 'manager') && (
          <Button 
            className="h-12 px-6"
            onClick={() => setCreateOpen(true)}
          >
            <span className="mr-2">➕</span>
            {role === 'tenant' ? 'Report Issue' : 'New Ticket'}
          </Button>
        )}
      </div>

      {/* Stats Grid — role-aware */}
      {statsLoading ? (
        <div className={`grid grid-cols-2 ${role === 'manager' ? 'md:grid-cols-5' : 'md:grid-cols-3'} gap-4`}>
          {[...Array(role === 'manager' ? 5 : 3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {role === 'tenant' && (
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Open"
                value={stats?.open || 0}
                color="bg-blue-500"
                icon="📋"
              />
              <StatCard
                label="In Progress"
                value={stats?.inProgress || 0}
                color="bg-purple-500"
                icon="🔧"
              />
              <StatCard
                label="Resolved"
                value={stats?.done || 0}
                color="bg-green-500"
                icon="✅"
              />
            </div>
          )}

          {role === 'technician' && (
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Assigned to Me"
                value={stats?.assigned || 0}
                color="bg-yellow-500"
                icon="📥"
              />
              <StatCard
                label="In Progress"
                value={stats?.inProgress || 0}
                color="bg-purple-500"
                icon="🔧"
              />
              <StatCard
                label="Completed"
                value={stats?.done || 0}
                color="bg-green-500"
                icon="✅"
              />
            </div>
          )}

          {role === 'manager' && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                label="Resolved"
                value={stats?.done || 0}
                color="bg-green-500"
                icon="✅"
              />
              <StatCard
                label="Urgent"
                value={stats?.urgent || 0}
                color="bg-red-500"
                icon="⚠️"
              />
            </div>
          )}
        </>
      )}

      {/* Recent Tickets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{recentTitle}</h2>
          <Button 
            variant="outline"
            onClick={() => navigate({ to: '/dashboard/tickets' })}
          >
            View All
          </Button>
        </div>

        {ticketsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : recentTickets?.tickets?.length ? (
          <div className="space-y-4">
            {recentTickets.tickets.slice(0, 5).map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate({ to: '/dashboard/tickets/$ticketId', params: { ticketId: ticket.id } })}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {ticket.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          ticket.status === 'open'
                            ? 'bg-blue-100 text-blue-700'
                            : ticket.status === 'assigned'
                              ? 'bg-yellow-100 text-yellow-700'
                              : ticket.status === 'in_progress'
                                ? 'bg-purple-100 text-purple-700'
                                : ticket.status === 'done'
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
                        {ticket.unitNumber || 'No unit'}
                      </span>
                      {/* Show creator name for managers & technicians */}
                      {role !== 'tenant' && ticket.creator && (
                        <span className="text-xs text-gray-500">
                          📝 {ticket.creator.name}
                        </span>
                      )}
                      {/* Show assignee for managers */}
                      {role === 'manager' && (
                        ticket.assignee ? (
                          <span className="text-xs text-green-600 font-medium">
                            👤 {ticket.assignee.name}
                          </span>
                        ) : (
                          <span className="text-xs text-orange-500 font-medium">
                            ⚠️ Unassigned
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-4xl mb-3">
              {role === 'tenant' ? '🏠' : role === 'technician' ? '🔧' : '📊'}
            </div>
            <p className="text-gray-600">
              {role === 'tenant'
                ? 'You haven\'t reported any issues yet'
                : role === 'technician'
                  ? 'No tasks assigned to you right now'
                  : 'No tickets in the system yet'}
            </p>
            {(role === 'tenant' || role === 'manager') && (
              <Button 
                className="mt-4"
                onClick={() => setCreateOpen(true)}
              >
                {role === 'tenant' ? 'Report First Issue' : 'Create First Ticket'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Ticket Dialog */}
      <CreateTicketDialog open={createOpen} onClose={() => setCreateOpen(false)} />
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

