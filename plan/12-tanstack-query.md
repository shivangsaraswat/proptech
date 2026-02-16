# TanStack Query Implementation Guide

## Overview

TanStack Query (React Query) manages all server state with automatic caching, background refetching, optimistic updates, and intelligent cache invalidation.

**Key Benefits:**
- Automatic background refetching
- Optimistic UI updates for instant feedback
- Smart cache invalidation
- Request deduplication
- Prefetching on route navigation
- Offline support
- DevTools for debugging

---

## Query Client Setup

### `lib/query-client.ts`
```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Root Setup (`__root.tsx`)
```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackRouterDevtools />
      <Toaster />
    </QueryClientProvider>
  );
}
```

---

## Query Keys Strategy

Centralized query key factory for type safety and consistency.

### `lib/query-keys.ts`
```ts
export const queryKeys = {
  // Auth
  auth: {
    me: () => ["auth", "me"] as const,
  },

  // Tickets
  tickets: {
    all: () => ["tickets"] as const,
    lists: () => ["tickets", "list"] as const,
    list: (filters: TicketFilters) => ["tickets", "list", filters] as const,
    details: () => ["tickets", "detail"] as const,
    detail: (id: string) => ["tickets", "detail", id] as const,
    comments: (id: string) => ["tickets", id, "comments"] as const,
    images: (id: string) => ["tickets", id, "images"] as const,
  },

  // Notifications
  notifications: {
    all: () => ["notifications"] as const,
    list: (filters?: NotificationFilters) => ["notifications", "list", filters] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
  },

  // Dashboard
  dashboard: {
    stats: () => ["dashboard", "stats"] as const,
  },

  // Users
  users: {
    all: () => ["users"] as const,
    technicians: () => ["users", "technicians"] as const,
  },
};
```

---

## Query Hooks

### `hooks/queries/use-tickets.ts`
```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export interface TicketFilters {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Fetch tickets list
export function useTickets(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: queryKeys.tickets.list(filters),
    queryFn: async () => {
      const { data } = await api.get("/tickets", { params: filters });
      return data.data;
    },
  });
}

// Create ticket mutation with optimistic update
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTicket: CreateTicketInput) => {
      const { data } = await api.post("/tickets", newTicket);
      return data.data;
    },
    onMutate: async (newTicket) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tickets.lists() });

      // Snapshot previous value
      const previousTickets = queryClient.getQueryData(queryKeys.tickets.list({}));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.tickets.list({}), (old: any) => {
        const optimisticTicket = {
          id: `temp-${Date.now()}`,
          ...newTicket,
          status: "open",
          createdAt: new Date().toISOString(),
        };
        return {
          ...old,
          tickets: [optimisticTicket, ...(old?.tickets || [])],
          pagination: {
            ...old?.pagination,
            total: (old?.pagination?.total || 0) + 1,
          },
        };
      });

      return { previousTickets };
    },
    onError: (err, newTicket, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.tickets.list({}), context?.previousTickets);
      toast.error("Failed to create ticket");
    },
    onSuccess: () => {
      toast.success("Ticket created successfully");
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

// Update ticket mutation with optimistic update
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Ticket> }) => {
      const { data } = await api.patch(`/tickets/${id}`, updates);
      return data.data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: queryKeys.tickets.detail(id) });

      // Snapshot
      const previousTicket = queryClient.getQueryData(queryKeys.tickets.detail(id));

      // Optimistically update
      queryClient.setQueryData(queryKeys.tickets.detail(id), (old: any) => ({
        ...old,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));

      // Also update in list
      queryClient.setQueriesData({ queryKey: queryKeys.tickets.lists() }, (old: any) => {
        if (!old?.tickets) return old;
        return {
          ...old,
          tickets: old.tickets.map((ticket: any) =>
            ticket.id === id ? { ...ticket, ...updates } : ticket
          ),
        };
      });

      return { previousTicket };
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData(queryKeys.tickets.detail(id), context?.previousTicket);
      toast.error("Failed to update ticket");
    },
    onSuccess: () => {
      toast.success("Ticket updated");
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}
```

### `hooks/queries/use-ticket-detail.ts`
```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useTicketDetail(ticketId: string) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: async () => {
      const { data } = await api.get(`/tickets/${ticketId}`);
      return data.data;
    },
    enabled: !!ticketId,
  });
}

// Add comment mutation
export function useAddComment(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post(`/tickets/${ticketId}/comments`, { content });
      return data.data;
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tickets.detail(ticketId) });
      
      const previousTicket = queryClient.getQueryData(queryKeys.tickets.detail(ticketId));

      // Optimistically add comment
      queryClient.setQueryData(queryKeys.tickets.detail(ticketId), (old: any) => ({
        ...old,
        comments: [
          ...(old?.comments || []),
          {
            id: `temp-${Date.now()}`,
            content,
            author: { id: "me", name: "You" }, // Get from auth store
            createdAt: new Date().toISOString(),
          },
        ],
      }));

      return { previousTicket };
    },
    onError: (err, content, context) => {
      queryClient.setQueryData(queryKeys.tickets.detail(ticketId), context?.previousTicket);
      toast.error("Failed to add comment");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) });
    },
  });
}

// Add images mutation
export function useAddImages(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageUrls: string[]) => {
      const { data } = await api.post(`/tickets/${ticketId}/images`, { imageUrls });
      return data.data;
    },
    onSuccess: () => {
      toast.success("Images added");
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) });
    },
  });
}
```

### `hooks/queries/use-notifications.ts`
```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

// Polling notifications every 30s
export function useNotifications(filters?: { unread?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: async () => {
      const { data } = await api.get("/notifications", { params: filters });
      return data.data;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

// Unread count (for bell badge)
export function useUnreadNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const { data } = await api.get("/notifications", { params: { unread: true } });
      return data.data.unreadCount;
    },
    refetchInterval: 30000,
  });
}

// Mark as read mutation
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await api.patch(`/notifications/${notificationId}/read`);
      return data.data;
    },
    onMutate: async (notificationId) => {
      // Optimistically mark as read
      queryClient.setQueryData(queryKeys.notifications.list({}), (old: any) => ({
        ...old,
        notifications: old?.notifications.map((n: any) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, (old?.unreadCount || 0) - 1),
      }));

      queryClient.setQueryData(queryKeys.notifications.unreadCount(), (old: number = 0) =>
        Math.max(0, old - 1)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
}

// Mark all as read
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch("/notifications/read-all");
      return data.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.notifications.unreadCount(), 0);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      toast.success("All notifications marked as read");
    },
  });
}
```

### `hooks/queries/use-dashboard.ts`
```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const { data } = await api.get("/dashboard/stats");
      return data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
```

### `hooks/queries/use-users.ts`
```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useTechnicians() {
  return useQuery({
    queryKey: queryKeys.users.technicians(),
    queryFn: async () => {
      const { data } = await api.get("/users/technicians");
      return data.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (rarely changes)
  });
}
```

---

## Component Usage Examples

### Ticket List with Filters
```tsx
import { useTickets } from "@/hooks/queries/use-tickets";

function TicketListPage() {
  const [filters, setFilters] = useState<TicketFilters>({});
  const { data, isLoading, error } = useTickets(filters);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      <TicketFilters filters={filters} onChange={setFilters} />
      <TicketList tickets={data.tickets} />
    </div>
  );
}
```

### Create Ticket with Optimistic UI
```tsx
import { useCreateTicket } from "@/hooks/queries/use-tickets";
import { useForm } from "react-hook-form";

function CreateTicketForm() {
  const createTicket = useCreateTicket();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: CreateTicketInput) => {
    createTicket.mutate(data, {
      onSuccess: () => {
        // Navigate or close modal
        navigate("/dashboard/tickets");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <Button type="submit" disabled={createTicket.isPending}>
        {createTicket.isPending ? "Creating..." : "Create Ticket"}
      </Button>
    </form>
  );
}
```

### Update Ticket Status (Optimistic)
```tsx
import { useUpdateTicket } from "@/hooks/queries/use-tickets";

function TicketStatusSelect({ ticketId, currentStatus }: Props) {
  const updateTicket = useUpdateTicket();

  const handleStatusChange = (newStatus: string) => {
    updateTicket.mutate({
      id: ticketId,
      updates: { status: newStatus },
    });
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      {/* Options */}
    </Select>
  );
}
```

### Notification Bell with Real-time Updates
```tsx
import { useUnreadNotifications } from "@/hooks/queries/use-notifications";

function NotificationBell() {
  const { data: unreadCount = 0 } = useUnreadNotifications();

  return (
    <button className="relative">
      <BellIcon />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
```

---

## Prefetching Strategy

### Prefetch on Route Hover
```tsx
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { Link } from "@tanstack/react-router";

function TicketCard({ ticket }: Props) {
  const prefetchTicket = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.tickets.detail(ticket.id),
      queryFn: async () => {
        const { data } = await api.get(`/tickets/${ticket.id}`);
        return data.data;
      },
    });
  };

  return (
    <Link
      to="/dashboard/tickets/$ticketId"
      params={{ ticketId: ticket.id }}
      onMouseEnter={prefetchTicket}
    >
      {/* Card content */}
    </Link>
  );
}
```

### Prefetch on Route Load
```tsx
// In route loader
export const Route = createFileRoute("/dashboard/tickets/$ticketId")({
  loader: async ({ params }) => {
    // Prefetch ticket details
    await queryClient.ensureQueryData({
      queryKey: queryKeys.tickets.detail(params.ticketId),
      queryFn: async () => {
        const { data } = await api.get(`/tickets/${params.ticketId}`);
        return data.data;
      },
    });
  },
  component: TicketDetailPage,
});
```

---

## Cache Invalidation Patterns

### After Mutation
```ts
// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });

// Invalidate exact query
queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(id), exact: true });

// Invalidate multiple related queries
queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all() });
```

### Manual Refetch
```ts
const { refetch } = useTickets();

<Button onClick={() => refetch()}>Refresh</Button>
```

### Reset Query
```ts
queryClient.resetQueries({ queryKey: queryKeys.tickets.all() });
```

---

## Error Handling

### Global Error Handler
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        if (error.response?.status === 401) {
          // Redirect to login
          authStore.logout();
          router.navigate({ to: "/login" });
        }
      },
    },
  },
});
```

### Component-Level Error Handling
```tsx
const { data, error, isError } = useTickets();

if (isError) {
  return <ErrorState message={error.message} retry={refetch} />;
}
```

---

## DevTools

TanStack Query DevTools show:
- All queries and their state
- Cache contents
- Query timelines
- Network requests
- Mutations in flight

Access: Click floating icon (dev mode only)

---

## Performance Best Practices

1. ✅ Use query keys consistently (factory pattern)
2. ✅ Set appropriate `staleTime` based on data volatility
3. ✅ Implement optimistic updates for instant feedback
4. ✅ Prefetch on hover/navigation for perceived performance
5. ✅ Use `select` to transform data and prevent re-renders
6. ✅ Debounce search inputs before triggering queries
7. ✅ Use pagination for large lists
8. ✅ Enable `suspense` mode for loading states (optional)

---

## Migration from Router Loaders

Some initial data can still be loaded via TanStack Router loaders, then TanStack Query takes over for subsequent updates:

```tsx
export const Route = createFileRoute("/dashboard/tickets")({
  loader: async () => {
    // Initial load via router
    return await queryClient.ensureQueryData({
      queryKey: queryKeys.tickets.list({}),
      queryFn: fetchTickets,
    });
  },
  component: () => {
    // Component uses query hook
    const { data } = useTickets();
    return <TicketList tickets={data.tickets} />;
  },
});
```

This provides instant initial render + automatic background refetching.
