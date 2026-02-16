// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: "ticket_assigned" | "ticket_updated" | "comment_added";
  title: string;
  message: string;
  ticketId?: string;
  isRead: boolean;
  createdAt: string;
}
