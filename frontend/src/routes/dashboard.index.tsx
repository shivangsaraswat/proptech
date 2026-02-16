import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { useAuthStore } from '@/stores/auth-store';
import { useDashboardStats } from '@/hooks/queries/use-dashboard';
import { useTickets } from '@/hooks/queries/use-tickets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const subtitle = "Overview of your maintenance activities and updates";

  const statsConfig = [
    {
      label: 'Open Requests',
      value: stats?.open || 0,
      roles: ['tenant', 'manager'],
    },
    {
      label: 'In Progress',
      value: stats?.inProgress || 0,
      roles: ['tenant', 'manager', 'technician'],
    },
    {
      label: 'Resolved',
      value: stats?.done || 0,
      roles: ['tenant', 'manager', 'technician'],
    },
    {
      label: 'Assigned',
      value: stats?.assigned || 0,
      roles: ['manager', 'technician'],
    },
    {
      label: 'Urgent',
      value: stats?.urgent || 0,
      roles: ['manager'],
    },
  ];

  const filteredStats = statsConfig.filter(stat =>
    role && stat.roles.includes(role)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
        </div>
        {role === 'tenant' && (
          <Button
            size="default"
            onClick={() => setCreateOpen(true)}
            className="px-6"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
            Report Issue
          </Button>
        )}
      </div>

      {/* Stats Grid - Minimalist */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted/50 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-muted/50 rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          filteredStats.map((stat) => (
            <Card key={stat.label} className="group shadow-sm border-border/60 hover:border-primary/20 hover:shadow-md transition-all duration-300 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  {stat.label}
                </CardTitle>
                {/* Decorative Icon based on label - simple logic */}
                <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary opacity-70 group-hover:opacity-100 group-hover:bg-primary/10 transition-all">
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-foreground group-hover:scale-105 transition-transform origin-left ease-out duration-300">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Tickets - Table View */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground text-xs"
            onClick={() => navigate({ to: '/dashboard/tickets' })}
          >
            View all
            <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-3 w-3" />
          </Button>
        </div>

        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {ticketsLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 w-full bg-muted/20 rounded animate-pulse" />
              ))}
            </div>
          ) : recentTickets?.tickets?.length ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b-border/60">
                  <TableHead className="w-[40%] pl-6">Ticket</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTickets.tickets.slice(0, 5).map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors border-b-border/40"
                    onClick={() => navigate({ to: '/dashboard/tickets/$ticketId', params: { ticketId: ticket.id } })}
                  >
                    <TableCell className="font-medium pl-6 py-4">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[200px] sm:max-w-xs">{ticket.title}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs font-normal">
                          {ticket.unitNumber ? `Unit ${ticket.unitNumber} • ` : ''}
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
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-sm">No recent activity found.</p>
              {(role === 'tenant' || role === 'manager') && (
                <Button variant="link" onClick={() => setCreateOpen(true)} className="mt-2">
                  Create your first ticket
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateTicketDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

