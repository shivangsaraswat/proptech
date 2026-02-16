import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTicket, useUpdateTicketStatus, useAddComment } from '@/hooks/queries/use-tickets';
import { AssignTicketDialog } from '@/components/tickets/assign-ticket-dialog';
import { useAuthStore } from '@/stores/auth-store';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { TicketStatus } from '@/types';

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

  const canChangeStatus = user?.role === 'manager' || user?.role === 'technician';
  const canAssign = user?.role === 'manager';

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
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎫</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket not found</h2>
        <p className="text-gray-600 mb-6">This ticket doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate({ to: '/dashboard/tickets' })}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/dashboard/tickets' })}
          className="h-10"
        >
          ← Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
          <p className="text-gray-600 mt-1">
            Created by {ticket.creator?.name || 'Unknown'} on{' '}
            {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Ticket Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  ticket.status === 'open'
                    ? 'bg-blue-100 text-blue-700'
                    : ticket.status === 'assigned'
                      ? 'bg-yellow-100 text-yellow-700'
                      : ticket.status === 'in_progress'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                }`}
              >
                {ticket.status.replace('_', ' ').toUpperCase()}
              </span>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
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
              {ticket.unitNumber && (
                <span className="text-sm text-gray-600">📍 {ticket.unitNumber}</span>
              )}
              {ticket.building && (
                <span className="text-sm text-gray-600">🏢 {ticket.building}</span>
              )}
            </div>
          </div>
          
          {canAssign && (
            <Button
              variant="outline"
              onClick={() => setAssignOpen(true)}
            >
              {ticket.assignee ? 'Reassign' : 'Assign Technician'}
            </Button>
          )}
        </div>

        {/* Assignee Info */}
        {ticket.assignee && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900 mb-2">Assigned To:</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                {ticket.assignee.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{ticket.assignee.name}</p>
                <p className="text-sm text-gray-600">{ticket.assignee.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {/* Status Actions */}
        {canChangeStatus && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Status</h3>
            <div className="flex gap-2 flex-wrap">
              {(['open', 'assigned', 'in_progress', 'done'] as TicketStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={ticket.status === status ? 'default' : 'outline'}
                  onClick={() => handleStatusChange(status)}
                  disabled={updatingStatus || ticket.status === status}
                  size="sm"
                >
                  {status.replace('_', ' ').toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activity & Comments */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity Log */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
          {ticket.activityLog && ticket.activityLog.length > 0 ? (
            <div className="space-y-3">
              {ticket.activityLog.map((activity) => (
                <div key={activity.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
                    {activity.user?.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user?.name || 'Someone'}</span>{' '}
                      {activity.details}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No activity yet</p>
          )}
        </div>

        {/* Comments */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
          
          {/* Comment List */}
          {ticket.comments && ticket.comments.length > 0 ? (
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
              {ticket.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {comment.user?.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-sm text-gray-900">
                        {comment.user?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{comment.comment}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-6">No comments yet</p>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleSubmit(onCommentSubmit)} className="space-y-3">
            <div>
              <Label htmlFor="comment">Add a comment</Label>
              <Textarea
                id="comment"
                placeholder="Write your comment here..."
                className="mt-1.5 min-h-[80px]"
                disabled={addingComment}
                {...register('content', { required: 'Comment cannot be empty' })}
              />
              {errors.content && (
                <p className="text-xs text-red-600 mt-1">{errors.content.message}</p>
              )}
            </div>
            <Button type="submit" disabled={addingComment} className="w-full">
              {addingComment ? 'Adding...' : 'Add Comment'}
            </Button>
          </form>
        </div>
      </div>

      {/* Assign Dialog */}
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
