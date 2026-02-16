// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: "ticket_assigned" | "ticket_status_changed" | "ticket_comment";
  title: string;
  message: string;
  relatedTicketId?: string;
  isRead: boolean;
  createdAt: string;
}
