import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { Ticket, TicketStatus } from '@/types';
import { useTickets } from '@/hooks/queries/use-tickets';
import { Button } from '@/components/ui/button';
import { CreateTicketDialog } from '@/components/tickets/create-ticket-dialog';
import { AssignTicketDialog } from '@/components/tickets/assign-ticket-dialog';
import { useAuthStore } from '@/stores/auth-store';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tickets</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {user?.role === 'manager'
              ? 'Manage and assign maintenance requests'
              : user?.role === 'technician'
                ? 'Your assigned maintenance tasks'
                : 'Track your maintenance requests'}
          </p>
        </div>
        {user?.role === 'tenant' && (
          <Button
            size="default"
            onClick={() => setCreateOpen(true)}
            className="px-6"
          >
            <span className="mr-2 h-4 w-4 flex items-center justify-center text-lg leading-none">+</span>
            Report Issue
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap pb-2">
        {['', 'open', 'assigned', 'in_progress', 'done'].map((status) => {
          if (status === 'assigned' && user?.role === 'tenant') return null;
          return (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status as TicketStatus | '')}
              className="capitalize px-4 text-xs h-8"
            >
              {status === '' ? 'All' : status.replace('_', ' ')}
            </Button>
          );
        })}
      </div>

      {/* Tickets List - Table View */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-full bg-muted/20 rounded animate-pulse" />
            ))}
          </div>
        ) : tickets.length > 0 ? (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b-border/60">
                <TableHead className="w-[40%] pl-6">Ticket Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Date</TableHead>
                {/* <TableHead className="text-right pr-6">Action</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors border-b-border/40"
                  onClick={() => navigate({ to: '/dashboard/tickets/$ticketId', params: { ticketId: ticket.id } })}
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium text-foreground truncate max-w-[300px]">{ticket.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {ticket.unitNumber ? `Unit ${ticket.unitNumber} • ` : ''}
                        {ticket.building ? `${ticket.building} • ` : ''}
                        #{ticket.id.slice(0, 8)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`
                       font-normal capitalize shadow-none px-2 py-0.5 rounded-full text-[10px]
                       ${ticket.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100' : ''}
                       ${ticket.status === 'in_progress' ? 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100' : ''}
                       ${ticket.status === 'done' ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : ''}
                       ${ticket.status === 'assigned' ? 'bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100' : ''}
                     `}
                    >
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`
                      text-xs font-medium capitalize
                      ${ticket.priority === 'urgent' ? 'text-red-500' : ''}
                      ${ticket.priority === 'high' ? 'text-orange-500' : ''}
                      ${ticket.priority === 'medium' ? 'text-yellow-600' : ''}
                      ${ticket.priority === 'low' ? 'text-slate-500' : ''}
                   `}>
                      {ticket.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    {ticket.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground">
                          {ticket.assignee.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{ticket.assignee.name.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  {user?.role === 'manager' && (
                    <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-4 text-2xl">
              🎫
            </div>
            <h3 className="text-lg font-medium text-foreground">No tickets found</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm">
              {statusFilter
                ? `No tickets found with status "${statusFilter.replace('_', ' ')}"`
                : "Looks like there are no maintenance requests at the moment."}
            </p>
            {!statusFilter && user?.role === 'tenant' && (
              <Button variant="outline" onClick={() => setCreateOpen(true)} className="mt-4">
                Create Ticket
              </Button>
            )}
          </div>
        )}
      </div>

      <CreateTicketDialog open={createOpen} onClose={() => setCreateOpen(false)} />

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
