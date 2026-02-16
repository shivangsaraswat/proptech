// Re-export all types for easier imports
export type { AuthResponse, LoginInput, RegisterInput, User } from './auth';

export type {
  CreateTicketInput,
  Ticket,
  TicketActivity,
  TicketComment,
  TicketPriority,
  TicketStatus,
  UpdateTicketInput,
} from './ticket';

export type { Notification } from './notification';

export type { ApiResponse, DashboardStats, PaginatedResponse } from './api';
