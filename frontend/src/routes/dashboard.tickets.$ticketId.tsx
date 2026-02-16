import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  Building03Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Comment01Icon,
  Location01Icon,
  Message01Icon,
  PencilEdit02Icon,
  Time01Icon,
  UserIcon
} from '@hugeicons/core-free-icons';
import type { TicketStatus } from '@/types';
import { useAddComment, useTicket, useUpdateTicketStatus } from '@/hooks/queries/use-tickets';
import { AssignTicketDialog } from '@/components/tickets/assign-ticket-dialog';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/dashboard/tickets/$ticketId')({
  component: TicketDetailPage,
});

function TicketDetailPage() {
  const navigate = useNavigate();
  const { ticketId } = Route.useParams();
  const { user } = useAuthStore();
  const { data: ticket, isLoading } = useTicket(ticketId);
  const { mutateAsync: updateStatus, isPending: updatingStatus } = useUpdateTicketStatus(ticketId);
  const { mutateAsync: addComment, isPending: addingComment } = useAddComment(ticketId);
  const [assignOpen, setAssignOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ content: string }>();

  // Managers can ONLY assign/reassign. Technicians can ONLY update status.
  const canChangeStatus = user?.role === 'technician';
  // Manager cannot reassign if the ticket is already being worked on or done
  const canAssign = user?.role === 'manager' && ticket && !['in_progress', 'done'].includes(ticket.status);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      await updateStatus(newStatus);
      toast.success('Status updated successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const onCommentSubmit = async (data: { content: string }) => {
    try {
      await addComment(data.content);
      toast.success('Comment added!');
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <HugeiconsIcon icon={Message01Icon} className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Ticket not found</h2>
        <p className="text-muted-foreground mb-6">This ticket doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate({ to: '/dashboard/tickets' })}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/dashboard/tickets' })}
              className="h-8 px-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-1" />
              Back
            </Button>
            <span className="text-xs text-muted-foreground">#{ticket.id.slice(0, 8)}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{ticket.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Calendar03Icon} className="h-4 w-4" />
              <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
              <span>{ticket.creator?.name || 'Unknown'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canAssign && (
            <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
              <HugeiconsIcon icon={PencilEdit02Icon} className="h-4 w-4 mr-2" />
              {ticket.assignee ? 'Reassign' : 'Assign Technician'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Ticket Details Card */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status & Priority Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className={`
                        px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                        ${ticket.status === 'open' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : ''}
                        ${ticket.status === 'in_progress' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' : ''}
                        ${ticket.status === 'done' ? 'bg-green-50 text-green-700 hover:bg-green-100' : ''}
                        ${ticket.status === 'assigned' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : ''}
                     `}>
                  {ticket.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={`
                        px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border-0
                        ${ticket.priority === 'urgent' ? 'bg-red-50 text-red-700' : ''}
                        ${ticket.priority === 'high' ? 'bg-orange-50 text-orange-700' : ''}
                        ${ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' : ''}
                        ${ticket.priority === 'low' ? 'bg-slate-50 text-slate-700' : ''}
                     `}>
                  {ticket.priority} Priority
                </Badge>
              </div>

              {/* Location Info */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/40">
                {ticket.building && (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground">
                      <HugeiconsIcon icon={Building03Icon} className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Building</p>
                      <p className="text-sm font-medium">{ticket.building}</p>
                    </div>
                  </div>
                )}
                {ticket.unitNumber && (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground">
                      <HugeiconsIcon icon={Location01Icon} className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Unit</p>
                      <p className="text-sm font-medium">{ticket.unitNumber}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Description</h3>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              {/* Update Status Actions */}
              {canChangeStatus && (
                <div className="pt-4 border-t border-border/40">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Update Status</h3>
                  <div className="flex flex-wrap gap-2 justify-start">
                    {(['open', 'in_progress', 'done'] as Array<TicketStatus>).map((status) => (
                      <Button
                        key={status}
                        variant={ticket.status === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(status)}
                        disabled={
                          updatingStatus ||
                          ticket.status === status ||
                          ticket.status === 'done' // Cannot change detailed status if already done
                        }
                        className="capitalize h-8 text-xs"
                      >
                        {ticket.status === status && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mr-1.5 h-3.5 w-3.5" />}
                        {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-lg flex items-center gap-2">
                <HugeiconsIcon icon={Comment01Icon} className="h-5 w-5 text-muted-foreground" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {ticket.comments && ticket.comments.length > 0 ? (
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                  {ticket.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0 border border-border">
                        {comment.user?.name.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{comment.user?.name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                          {comment.comment}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm italic">
                  No comments yet. Be the first to add one.
                </div>
              )}

              <form onSubmit={handleSubmit(onCommentSubmit)} className="space-y-4 pt-4 border-t border-border/40">
                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-xs font-medium uppercase text-muted-foreground">Add a comment</Label>
                  <Textarea
                    id="comment"
                    placeholder="Type your comment here..."
                    className="min-h-[100px] resize-none bg-muted/20 focus:bg-background transition-colors"
                    disabled={addingComment}
                    {...register('content', { required: 'Comment cannot be empty' })}
                  />
                  {errors.content && (
                    <p className="text-xs text-red-500">{errors.content.message}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={addingComment}>
                    {addingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar Content (Right Column) */}
        <div className="space-y-6">

          {/* Assignee Card */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.assignee ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {ticket.assignee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-sm truncate">{ticket.assignee.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{ticket.assignee.email}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] h-5 px-1.5 font-normal border-primary/20 text-primary bg-primary/5">
                      Technician
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted border border-border/50 flex items-center justify-center">
                    <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <span className="italic">Unassigned</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <HugeiconsIcon icon={Time01Icon} className="h-4 w-4" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pt-6">
              {ticket.activityLog && ticket.activityLog.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-border/60 ml-3 space-y-8">
                  {ticket.activityLog.map((activity) => (
                    <div key={activity.id} className="relative">
                      {/* Dot indicator */}
                      <span className="absolute -left-[29px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary ring-2 ring-background" />

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(activity.createdAt).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                          })}
                        </span>
                        <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                          <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                            {activity.user?.name || 'System'}
                          </p>
                          <p className="text-sm text-foreground/80 mt-1">{activity.details}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No activity recorded yet.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {assignOpen && (
        <AssignTicketDialog
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          ticket={ticket}
        />
      )}
    </div>
  );
}
