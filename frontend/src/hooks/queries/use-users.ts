import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, User } from '@/types';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';

// Get all technicians (for assignment)
export function useTechnicians() {
  return useQuery({
    queryKey: queryKeys.users.technicians,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Array<User>>>(
        '/users/technicians'
      );
      return data.data;
    },
  });
}

// Get current user (me)
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
      return data.data;
    },
  });
}
