import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from '@/hooks/queries/use-notifications';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with all your maintenance activities
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleMarkAllAsRead}
          disabled={markingAll || !hasUnread}
        >
          {markingAll ? 'Marking...' : 'Mark All as Read'}
        </Button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : notificationsList.length > 0 ? (
        <div className="space-y-3">
          {notificationsList.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-white border rounded-lg p-4 hover:border-indigo-300 transition-all cursor-pointer ${
                !notification.isRead
                  ? 'border-indigo-200 bg-indigo-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">
                  {notification.type === 'ticket_created'
                    ? '🆕'
                    : notification.type === 'ticket_assigned'
                      ? '👤'
                      : notification.type === 'ticket_status_changed'
                        ? '🔄'
                        : notification.type === 'ticket_comment'
                          ? '💬'
                          : '🔔'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No notifications yet
          </h3>
          <p className="text-gray-600">
            You'll see notifications about your tickets here
          </p>
        </div>
      )}
    </div>
  );
}
