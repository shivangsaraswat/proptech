import { db } from "../config/database";
import {
  tickets,
  ticketImages,
  ticketComments,
  ticketActivityLog,
  users,
  notifications,
} from "../models/schema";
import { eq, and, or, ilike, desc, sql } from "drizzle-orm";
import { ApiError } from "../utils/api-error";
import {
  CreateTicketInput,
  UpdateTicketInput,
  AddCommentInput,
  AddImagesInput,
  TicketFiltersInput,
} from "../validators/ticket.validator";
import { activityService } from "./activity.service";
import { notificationService } from "./notification.service";
import { withTransaction, DbContext } from "../utils/transaction";
import { serviceLogger, logSuccess } from "../utils/logger";

export const ticketService = {
  async listTickets(userId: string, userRole: string, filters: TicketFiltersInput) {
    const { status, priority, search, page, limit } = filters;
    const offset = (page - 1) * limit;

    // Build where conditions based on role
    const conditions = [];

    // Role-based filtering
    if (userRole === "tenant") {
      conditions.push(eq(tickets.createdBy, userId));
    } else if (userRole === "technician") {
      conditions.push(eq(tickets.assignedTo, userId));
    }
    // Managers see all tickets

    // Status filter
    if (status) {
      conditions.push(eq(tickets.status, status));
    }

    // Priority filter
    if (priority) {
      conditions.push(eq(tickets.priority, priority));
    }

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(tickets.title, `%${search}%`),
          ilike(tickets.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get tickets with creator and assignee info in a single query
    const creatorAlias = users;
    const ticketList = await db
      .select({
        id: tickets.id,
        title: tickets.title,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        unitNumber: tickets.unitNumber,
        building: tickets.building,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        createdBy: tickets.createdBy,
        assignedTo: tickets.assignedTo,
        creatorId: creatorAlias.id,
        creatorName: creatorAlias.name,
        creatorEmail: creatorAlias.email,
        creatorAvatar: creatorAlias.avatarUrl,
      })
      .from(tickets)
      .leftJoin(creatorAlias, eq(tickets.createdBy, creatorAlias.id))
      .where(whereClause)
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset);

    // Build assignee lookup in single batch query instead of N+1
    const assignedToIds = ticketList
      .map((t) => t.assignedTo)
      .filter((id): id is string => id !== null);

    let assigneeMap = new Map<string, { id: string; name: string; email: string; avatarUrl: string | null }>();
    if (assignedToIds.length > 0) {
      const uniqueIds = [...new Set(assignedToIds)];
      const assignees = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(
          or(...uniqueIds.map((uid) => eq(users.id, uid)))!
        );

      for (const a of assignees) {
        assigneeMap.set(a.id, a);
      }
    }

    const ticketsWithAssignee = ticketList.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      unitNumber: ticket.unitNumber,
      building: ticket.building,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      creator: {
        id: ticket.creatorId,
        name: ticket.creatorName,
        email: ticket.creatorEmail,
        avatarUrl: ticket.creatorAvatar,
      },
      assignee: ticket.assignedTo ? assigneeMap.get(ticket.assignedTo) ?? null : null,
    }));

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tickets)
      .where(whereClause);

    return {
      tickets: ticketsWithAssignee,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  async getTicket(ticketId: string, userId: string, userRole: string) {
    // Get ticket with creator
    const [ticket] = await db
      .select({
        id: tickets.id,
        title: tickets.title,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        unitNumber: tickets.unitNumber,
        building: tickets.building,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        createdBy: tickets.createdBy,
        assignedTo: tickets.assignedTo,
      })
      .from(tickets)
      .where(eq(tickets.id, ticketId));

    if (!ticket) {
      throw ApiError.notFound("Ticket not found");
    }

    // Check access: tenant can only see their own, technician only assigned, manager sees all
    if (userRole === "tenant" && ticket.createdBy !== userId) {
      throw ApiError.forbidden("Access denied");
    }
    if (userRole === "technician" && ticket.assignedTo !== userId) {
      throw ApiError.forbidden("Access denied");
    }

    // Get creator
    const [creator] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, ticket.createdBy));

    // Get assignee if exists
    let assignee = null;
    if (ticket.assignedTo) {
      const [assigneeData] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(eq(users.id, ticket.assignedTo));
      assignee = assigneeData || null;
    }

    // Get images
    const images = await db
      .select()
      .from(ticketImages)
      .where(eq(ticketImages.ticketId, ticketId))
      .orderBy(ticketImages.createdAt);

    // Get comments with user info
    const comments = await db
      .select({
        id: ticketComments.id,
        content: ticketComments.content,
        createdAt: ticketComments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(ticketComments)
      .leftJoin(users, eq(ticketComments.userId, users.id))
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(ticketComments.createdAt);

    // Get activity log with user info
    const activityLog = await db
      .select({
        id: ticketActivityLog.id,
        action: ticketActivityLog.action,
        details: ticketActivityLog.details,
        createdAt: ticketActivityLog.createdAt,
        user: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(ticketActivityLog)
      .leftJoin(users, eq(ticketActivityLog.userId, users.id))
      .where(eq(ticketActivityLog.ticketId, ticketId))
      .orderBy(ticketActivityLog.createdAt);

    return {
      ...ticket,
      creator,
      assignee,
      images,
      comments,
      activityLog,
    };
  },

  async createTicket(input: CreateTicketInput, userId: string) {
    const startTime = Date.now();
    serviceLogger.info(
      { userId, title: input.title, priority: input.priority },
      "Creating new ticket"
    );

    return withTransaction(async (tx) => {
      // Create ticket
      const [newTicket] = await tx
        .insert(tickets)
        .values({
          title: input.title,
          description: input.description,
          priority: input.priority || "medium",
          unitNumber: input.unitNumber,
          building: input.building,
          createdBy: userId,
          status: "open",
        })
        .returning();

      // Add images if provided
      if (input.imageUrls && input.imageUrls.length > 0) {
        await tx.insert(ticketImages).values(
          input.imageUrls.map((url) => ({
            ticketId: newTicket.id,
            imageUrl: url,
          }))
        );
      }

      // Log activity
      await tx.insert(ticketActivityLog).values({
        ticketId: newTicket.id,
        userId,
        action: "created",
        details: `Created ticket: ${newTicket.title}`,
      });

      logSuccess(
        serviceLogger,
        "Ticket created successfully",
        Date.now() - startTime,
        { ticketId: newTicket.id, userId, imageCount: input.imageUrls?.length || 0 }
      );

      return newTicket;
    });
  },

  async updateTicket(
    ticketId: string,
    input: UpdateTicketInput,
    userId: string,
    userRole: string
  ) {
    return withTransaction(async (tx) => {
      // Get current ticket
      const [currentTicket] = await tx
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId));

      if (!currentTicket) {
        throw ApiError.notFound("Ticket not found");
      }

      // Check permissions
      if (userRole === "tenant") {
        throw ApiError.forbidden("Tenants cannot update tickets");
      }
      if (userRole === "technician" && currentTicket.assignedTo !== userId) {
        throw ApiError.forbidden("You can only update tickets assigned to you");
      }

      // Update ticket
      const [updatedTicket] = await tx
        .update(tickets)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(tickets.id, ticketId))
        .returning();

      // Log changes
      const changes: string[] = [];
      if (input.status && input.status !== currentTicket.status) {
        changes.push(`Status changed from ${currentTicket.status} to ${input.status}`);

        // Notify ticket creator of status change
        await notificationService.notifyTicketStatusChange(
          currentTicket.createdBy,
          ticketId,
          currentTicket.title,
          input.status
        );
      }
      if (input.priority && input.priority !== currentTicket.priority) {
        changes.push(`Priority changed from ${currentTicket.priority} to ${input.priority}`);
      }
      if (input.assignedTo !== undefined && input.assignedTo !== currentTicket.assignedTo) {
        if (input.assignedTo === null) {
          changes.push("Unassigned technician");
        } else {
          const [assignee] = await tx
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, input.assignedTo));
          changes.push(`Assigned to ${assignee?.name || "technician"}`);

          // Notify assignee
          await notificationService.notifyTicketAssignment(
            input.assignedTo,
            ticketId,
            currentTicket.title
          );
        }
      }

      if (changes.length > 0) {
        await tx.insert(ticketActivityLog).values({
          ticketId,
          userId,
          action: "updated",
          details: changes.join(", "),
        });
      }

      return updatedTicket;
    });
  },

  async addComment(ticketId: string, input: AddCommentInput, userId: string) {
    return withTransaction(async (tx) => {
      // Check if ticket exists
      const [ticket] = await tx
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId));

      if (!ticket) {
        throw ApiError.notFound("Ticket not found");
      }

      // Add comment
      const [newComment] = await tx
        .insert(ticketComments)
        .values({
          ticketId,
          userId,
          content: input.content,
        })
        .returning();

      // Get user info
      const [user] = await tx
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, userId));

      // Log activity
      await tx.insert(ticketActivityLog).values({
        ticketId,
        userId,
        action: "commented",
        details: `Added a comment`,
      });

      // Notify relevant users (creator and assignee, but not the commenter)
      const notifyUsers = [ticket.createdBy];
      if (ticket.assignedTo) notifyUsers.push(ticket.assignedTo);

      for (const notifyUserId of notifyUsers) {
        if (notifyUserId !== userId) {
          await notificationService.notifyNewComment(
            notifyUserId,
            ticketId,
            ticket.title,
            user?.name || "Someone"
          );
        }
      }

      return newComment;
    });
  },

  async addImages(ticketId: string, input: AddImagesInput, userId: string) {
    return withTransaction(async (tx) => {
      // Check if ticket exists
      const [ticket] = await tx
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId));

      if (!ticket) {
        throw ApiError.notFound("Ticket not found");
      }

      // Add images
      const newImages = await tx
        .insert(ticketImages)
        .values(
          input.imageUrls.map((url) => ({
            ticketId,
            imageUrl: url,
          }))
        )
        .returning();

      // Log activity
      await tx.insert(ticketActivityLog).values({
        ticketId,
        userId,
        action: "added_images",
        details: `Added ${input.imageUrls.length} image(s)`,
      });

      return newImages;
    });
  },

  async assignTicket(ticketId: string, technicianId: string, userId: string, userRole: string) {
    if (userRole !== "manager") {
      throw ApiError.forbidden("Only managers can assign tickets");
    }

    return withTransaction(async (tx) => {
      const [ticket] = await tx
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId));

      if (!ticket) {
        throw ApiError.notFound("Ticket not found");
      }

      // Verify the technician exists and is active
      const [technician] = await tx
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(and(eq(users.id, technicianId), eq(users.role, "technician"), eq(users.isActive, true)));

      if (!technician) {
        throw ApiError.notFound("Technician not found or is not active");
      }

      // Update the ticket
      const [updatedTicket] = await tx
        .update(tickets)
        .set({
          assignedTo: technicianId,
          status: ticket.status === "open" ? "assigned" : ticket.status,
          updatedAt: new Date(),
        })
        .where(eq(tickets.id, ticketId))
        .returning();

      // Log activity
      await tx.insert(ticketActivityLog).values({
        ticketId,
        userId,
        action: "updated",
        details: `Assigned to ${technician.name}`,
      });

      // Notify the technician
      await notificationService.notifyTicketAssignment(
        technicianId,
        ticketId,
        ticket.title
      );

      return updatedTicket;
    });
  },

  async updateTicketStatus(
    ticketId: string,
    newStatus: string,
    userId: string,
    userRole: string
  ) {
    if (userRole === "tenant") {
      throw ApiError.forbidden("Tenants cannot change ticket status");
    }

    return withTransaction(async (tx) => {
      const [ticket] = await tx
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId));

      if (!ticket) {
        throw ApiError.notFound("Ticket not found");
      }

      // Technicians can only update tickets assigned to them
      if (userRole === "technician" && ticket.assignedTo !== userId) {
        throw ApiError.forbidden("You can only update tickets assigned to you");
      }

      const [updatedTicket] = await tx
        .update(tickets)
        .set({
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(tickets.id, ticketId))
        .returning();

      // Log activity
      await tx.insert(ticketActivityLog).values({
        ticketId,
        userId,
        action: "updated",
        details: `Status changed from ${ticket.status} to ${newStatus}`,
      });

      // Notify the ticket creator
      if (ticket.createdBy !== userId) {
        await notificationService.notifyTicketStatusChange(
          ticket.createdBy,
          ticketId,
          ticket.title,
          newStatus
        );
      }

      return updatedTicket;
    });
  },

  async deleteTicket(ticketId: string, userId: string, userRole: string) {
    if (userRole !== "manager") {
      throw ApiError.forbidden("Only managers can delete tickets");
    }

    return withTransaction(async (tx) => {
      const [ticket] = await tx
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId));

      if (!ticket) {
        throw ApiError.notFound("Ticket not found");
      }

      // Delete in dependency order
      await tx.delete(notifications).where(eq(notifications.relatedTicketId, ticketId));
      await tx.delete(ticketActivityLog).where(eq(ticketActivityLog.ticketId, ticketId));
      await tx.delete(ticketComments).where(eq(ticketComments.ticketId, ticketId));
      await tx.delete(ticketImages).where(eq(ticketImages.ticketId, ticketId));
      await tx.delete(tickets).where(eq(tickets.id, ticketId));

      return { deleted: true };
    });
  },
};
