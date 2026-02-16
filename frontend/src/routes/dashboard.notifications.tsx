import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Comment01Icon,
  Task01Icon,
  Ticket01Icon,
  UserIcon
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from '@/hooks/queries/use-notifications';

export const Route = createFileRoute('/dashboard/notifications')({
  component: NotificationsPage,
});

function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const { mutateAsync: markAllAsRead, isPending: markingAll } =
    useMarkAllNotificationsAsRead();
  const { mutateAsync: markAsRead } = useMarkNotificationAsRead();
  const notificationsList = notifications || [];
  const hasUnread = notificationsList.some((n) => !n.isRead);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleMarkAsRead = async (notificationId: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await markAsRead(notificationId);
    } catch {
      // silent fail
    }
  };

  const handleNotificationClick = async (notification: typeof notificationsList[0]) => {
    // Mark as read
    await handleMarkAsRead(notification.id, notification.isRead);

    // Navigate to related ticket if exists
    if (notification.relatedTicketId) {
      navigate({
        to: '/dashboard/tickets/$ticketId',
        params: { ticketId: notification.relatedTicketId },
      });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ticket_created':
        return Task01Icon;
      case 'ticket_assigned':
        return UserIcon;
      case 'ticket_status_changed':
        return CheckmarkCircle02Icon; // Or replace with a status icon
      case 'ticket_comment':
        return Comment01Icon;
      default:
        return Ticket01Icon;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Stay updated with all your maintenance activities
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={markingAll || !hasUnread}
          className="h-8 text-xs"
        >
          {markingAll ? 'Marking...' : 'Mark all as read'}
        </Button>
      </div>

      {/* Notifications List */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden divide-y divide-border/60">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-muted/20 rounded animate-pulse" />
            ))}
          </div>
        ) : notificationsList.length > 0 ? (
          <div className="divide-y divide-border/40">
            {notificationsList.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                group flex items-start gap-4 p-4 transition-all cursor-pointer hover:bg-muted/30
                ${!notification.isRead ? 'bg-blue-50/50 hover:bg-blue-50/80' : 'bg-transparent'}
              `}
              >
                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 
                 ${!notification.isRead ? 'bg-blue-100 text-blue-600' : 'bg-muted text-muted-foreground'}
              `}>
                  <HugeiconsIcon icon={getIcon(notification.type)} className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium truncate pr-4 ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                </div>

                {!notification.isRead && (
                  <div className="self-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <HugeiconsIcon icon={Ticket01Icon} className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No notifications yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              You'll see activity updates here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
