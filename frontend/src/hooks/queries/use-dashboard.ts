import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, DashboardStats } from '@/types';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<DashboardStats>>(
        '/dashboard/stats'
      );
      return data.data;
    },
  });
}
