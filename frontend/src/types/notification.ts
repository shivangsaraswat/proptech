// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: "ticket_assigned" | "ticket_status_changed" | "ticket_comment" | "ticket_created";
  title: string;
  message: string;
  relatedTicketId?: string;
  isRead: boolean;
  createdAt: string;
}
