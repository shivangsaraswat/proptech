import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { Ticket, TicketStatus } from '@/types';
import { useTickets } from '@/hooks/queries/use-tickets';
import { Button } from '@/components/ui/button';
import { CreateTicketDialog } from '@/components/tickets/create-ticket-dialog';
import { AssignTicketDialog } from '@/components/tickets/assign-ticket-dialog';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/dashboard/tickets/')({
  component: TicketsIndexPage,
});

function TicketsIndexPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [assignTicket, setAssignTicket] = useState<Ticket | null>(null);
  const { data: ticketsData, isLoading } = useTickets({
    status: statusFilter || undefined,
  });

  const tickets = ticketsData?.tickets || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'manager'
              ? 'Manage and assign maintenance requests'
              : user?.role === 'technician'
                ? 'Your assigned maintenance tasks'
                : 'Track your maintenance requests'}
          </p>
        </div>
        {(user?.role === 'tenant' || user?.role === 'manager') && (
          <Button
            className="h-12 px-6"
            onClick={() => setCreateOpen(true)}
          >
            <span className="mr-2">➕</span>
            {user?.role === 'tenant' ? 'Report Issue' : 'New Ticket'}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('')}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'open' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('open')}
        >
          Open
        </Button>
        <Button
          variant={statusFilter === 'assigned' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('assigned')}
        >
          Assigned
        </Button>
        <Button
          variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('in_progress')}
        >
          In Progress
        </Button>
        <Button
          variant={statusFilter === 'done' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('done')}
        >
          Done
        </Button>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate({ to: '/dashboard/tickets/$ticketId', params: { ticketId: ticket.id } })}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {ticket.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {ticket.description}
                  </p>
                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
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
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
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
                    <span className="text-sm text-gray-500">
                      {ticket.unitNumber || 'No unit'} • {ticket.building || 'No building'}
                    </span>
                    {ticket.creator && user?.role !== 'tenant' && (
                      <span className="text-sm text-gray-500">
                        📝 {ticket.creator.name}
                      </span>
                    )}
                    {ticket.assignee ? (
                      <span className="text-sm text-green-600 font-medium">
                        👤 {ticket.assignee.name}
                      </span>
                    ) : (
                      user?.role === 'manager' && (
                        <span className="text-sm text-orange-500 font-medium">
                          ⚠️ Unassigned
                        </span>
                      )
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <span className="text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  {user?.role === 'manager' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssignTicket(ticket);
                      }}
                    >
                      {ticket.assignee ? 'Reassign' : 'Assign'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tickets found
          </h3>
          <p className="text-gray-600 mb-6">
            {statusFilter
              ? `No ${statusFilter} tickets at the moment`
              : 'Create your first maintenance ticket'}
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            Create New Ticket
          </Button>
        </div>
      )}

      {/* Create Ticket Dialog */}
      <CreateTicketDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* Assign Ticket Dialog (Manager only) */}
      {assignTicket && (
        <AssignTicketDialog
          open={!!assignTicket}
          onClose={() => setAssignTicket(null)}
          ticket={assignTicket}
        />
      )}
    </div>
  );
}
