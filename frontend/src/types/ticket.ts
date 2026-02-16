// Ticket types
export type TicketStatus = "open" | "assigned" | "in_progress" | "done";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  unitNumber?: string;
  building?: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  images?: Array<TicketImage>;
  comments?: Array<TicketComment>;
  activityLog?: Array<TicketActivity>;
}

export interface TicketImage {
  id: string;
  ticketId: string;
  imageUrl: string;
  uploadedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  userId: string;
  action: string;
  details?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  unitNumber?: string;
  building?: string;
  imageUrls?: Array<string>;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
}

export interface AddCommentInput {
  content: string;
}

export interface AddImagesInput {
  imageUrls: Array<string>;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
  page?: number;
  limit?: number;
}
