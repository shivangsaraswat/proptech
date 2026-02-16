import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ApiResponse,
  CreateTicketInput,
  Ticket,
  TicketPriority,
  TicketStatus,
  UpdateTicketInput,
} from '@/types';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';

// List tickets with filters
export function useTickets(filters?: {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  createdBy?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.tickets.list(filters ?? {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters?.createdBy) params.append('createdBy', filters.createdBy);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const { data } = await apiClient.get<ApiResponse<{
        tickets: Array<Ticket>;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>>(
        `/tickets?${params.toString()}`
      );
      return data.data;
    },
  });
}

// Get single ticket
export function useTicket(ticketId: string) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Ticket>>(
        `/tickets/${ticketId}`
      );
      return data.data;
    },
    enabled: !!ticketId,
  });
}

// Create ticket
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTicketInput) => {
      const { data } = await apiClient.post<ApiResponse<Ticket>>(
        '/tickets',
        input
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

// Update ticket
export function useUpdateTicket(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTicketInput) => {
      const { data } = await apiClient.patch<ApiResponse<Ticket>>(
        `/tickets/${ticketId}`,
        input
      );
      return data.data;
    },
    onSuccess: (updatedTicket) => {
      queryClient.setQueryData(
        queryKeys.tickets.detail(ticketId),
        updatedTicket
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
}

// Assign ticket
export function useAssignTicket(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (technicianId: string) => {
      const { data } = await apiClient.post<ApiResponse<Ticket>>(
        `/tickets/${ticketId}/assign`,
        { technicianId }
      );
      return data.data;
    },
    onSuccess: (updatedTicket) => {
      queryClient.setQueryData(
        queryKeys.tickets.detail(ticketId),
        updatedTicket
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

// Update ticket status
export function useUpdateTicketStatus(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: TicketStatus) => {
      const { data } = await apiClient.patch<ApiResponse<Ticket>>(
        `/tickets/${ticketId}/status`,
        { status }
      );
      return data.data;
    },
    onSuccess: (updatedTicket) => {
      queryClient.setQueryData(
        queryKeys.tickets.detail(ticketId),
        updatedTicket
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
}

// Add comment
export function useAddComment(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await apiClient.post<ApiResponse<Ticket>>(
        `/tickets/${ticketId}/comments`,
        { content }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(ticketId),
      });
    },
  });
}

// Delete ticket
export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      await apiClient.delete(`/tickets/${ticketId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
}
