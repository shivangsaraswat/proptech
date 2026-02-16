import { db } from "../config/database";
import { notifications, users } from "../models/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { withTransaction, DbContext } from "../utils/transaction";

export const notificationService = {
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    relatedTicketId?: string;
  }): Promise<void> {
    return withTransaction(async (tx) => {
      await tx.insert(notifications).values({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        relatedTicketId: data.relatedTicketId,
        isRead: false,
      });
    });
  },

  async list(userId: string, unreadOnly: boolean = false) {
    const whereClause = unreadOnly
      ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      : eq(notifications.userId, userId);

    const result = await db
      .select({
        id: notifications.id,
        title: notifications.title,
        message: notifications.message,
        type: notifications.type,
        relatedTicketId: notifications.relatedTicketId,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt));

    return result;
  },

  async getUnreadCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    return Number(result?.count ?? 0);
  },

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    return withTransaction(async (tx) => {
      await tx
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        );
    });
  },

  async markAllAsRead(userId: string): Promise<void> {
    return withTransaction(async (tx) => {
      await tx
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        );
    });
  },

  async notifyTicketAssignment(
    assigneeId: string,
    ticketId: string,
    ticketTitle: string
  ): Promise<void> {
    await this.create({
      userId: assigneeId,
      title: "New Ticket Assigned",
      message: `You have been assigned to: ${ticketTitle}`,
      type: "ticket_assigned",
      relatedTicketId: ticketId,
    });
  },

  async notifyTicketStatusChange(
    userId: string,
    ticketId: string,
    ticketTitle: string,
    newStatus: string
  ): Promise<void> {
    await this.create({
      userId,
      title: "Ticket Status Updated",
      message: `Ticket "${ticketTitle}" status changed to: ${newStatus}`,
      type: "ticket_status_changed",
      relatedTicketId: ticketId,
    });
  },

  async notifyNewComment(
    userId: string,
    ticketId: string,
    ticketTitle: string,
    commenterName: string
  ): Promise<void> {
    await this.create({
      userId,
      title: "New Comment",
      message: `${commenterName} commented on: ${ticketTitle}`,
      type: "ticket_comment",
      relatedTicketId: ticketId,
    });
  },
};
