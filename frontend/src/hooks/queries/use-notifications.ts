import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse, Notification } from '@/types';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';

// List notifications
export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: queryKeys.notifications.list(unreadOnly),
    queryFn: async () => {
      const params = unreadOnly ? '?unread=true' : '';
      const { data } = await apiClient.get<
        ApiResponse<{ notifications: Notification[]; unreadCount: number }>
      >(`/notifications${params}`);
      return data.data?.notifications ?? [];
    },
  });
}

// Get unread count
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<{ count: number }>>(
        '/notifications/unread/count'
      );
      return data.data?.count ?? 0;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

// Mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.patch(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}

// Mark all as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}
