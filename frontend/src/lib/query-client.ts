import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack Query Client Configuration
 * Optimized for mobile-first with aggressive caching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: 1,
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

/**
 * Query Keys
 * Centralized query key factory for type-safety and consistency
 */
export const queryKeys = {
  // Auth
  auth: {
    me: ["auth", "me"] as const,
  },
  // Tickets
  tickets: {
    all: ["tickets"] as const,
    list: (filters: Record<string, unknown>) => ["tickets", "list", filters] as const,
    detail: (id: string) => ["tickets", "detail", id] as const,
  },
  // Notifications
  notifications: {
    all: ["notifications"] as const,
    list: (unreadOnly: boolean) => ["notifications", "list", { unreadOnly }] as const,
    unreadCount: ["notifications", "unreadCount"] as const,
  },
  // Dashboard
  dashboard: {
    stats: ["dashboard", "stats"] as const,
  },
  // Users
  users: {
    technicians: ["users", "technicians"] as const,
  },
};
