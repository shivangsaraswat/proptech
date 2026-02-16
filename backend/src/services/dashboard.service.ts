import { db } from "../config/database";
import { tickets } from "../models/schema";
import { eq, and, sql } from "drizzle-orm";

export const dashboardService = {
  async getStats(userId: string, userRole: string) {
    if (userRole === "tenant") {
      // Tenant stats: only their tickets
      const [stats] = await db
        .select({
          total: sql<number>`count(*)::int`,
          open: sql<number>`count(*) filter (where ${tickets.status} = 'open')::int`,
          inProgress: sql<number>`count(*) filter (where ${tickets.status} = 'in_progress')::int`,
          done: sql<number>`count(*) filter (where ${tickets.status} = 'done')::int`,
        })
        .from(tickets)
        .where(eq(tickets.createdBy, userId));

      return {
        total: stats.total,
        open: stats.open,
        inProgress: stats.inProgress,
        done: stats.done,
      };
    } else if (userRole === "technician") {
      // Technician stats: only assigned tickets
      const [stats] = await db
        .select({
          total: sql<number>`count(*)::int`,
          assigned: sql<number>`count(*) filter (where ${tickets.status} = 'assigned')::int`,
          inProgress: sql<number>`count(*) filter (where ${tickets.status} = 'in_progress')::int`,
          done: sql<number>`count(*) filter (where ${tickets.status} = 'done')::int`,
        })
        .from(tickets)
        .where(eq(tickets.assignedTo, userId));

      return {
        total: stats.total,
        assigned: stats.assigned,
        inProgress: stats.inProgress,
        done: stats.done,
      };
    } else {
      // Manager stats: all tickets
      const [stats] = await db
        .select({
          total: sql<number>`count(*)::int`,
          open: sql<number>`count(*) filter (where ${tickets.status} = 'open')::int`,
          assigned: sql<number>`count(*) filter (where ${tickets.status} = 'assigned')::int`,
          inProgress: sql<number>`count(*) filter (where ${tickets.status} = 'in_progress')::int`,
          done: sql<number>`count(*) filter (where ${tickets.status} = 'done')::int`,
          urgent: sql<number>`count(*) filter (where ${tickets.priority} = 'urgent')::int`,
        })
        .from(tickets);

      return {
        total: stats.total,
        open: stats.open,
        assigned: stats.assigned,
        inProgress: stats.inProgress,
        done: stats.done,
        urgent: stats.urgent,
      };
    }
  },
};
