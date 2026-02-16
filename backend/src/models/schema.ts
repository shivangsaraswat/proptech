import { 
  pgTable, 
  uuid, 
  timestamp, 
  varchar, 
  text, 
  boolean,
  pgEnum 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = pgEnum("user_role", ["tenant", "manager", "technician"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "assigned", "in_progress", "done"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "urgent"]);

// ============================================
// USERS TABLE
// ============================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("tenant"),
  phone: varchar("phone", { length: 50 }),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ============================================
// TICKETS TABLE
// ============================================

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").notNull().default("open"),
  priority: ticketPriorityEnum("priority").notNull().default("medium"),
  unitNumber: varchar("unit_number", { length: 50 }),
  building: varchar("building", { length: 255 }),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;

// ============================================
// TICKET IMAGES TABLE
// ============================================

export const ticketImages = pgTable("ticket_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TicketImage = typeof ticketImages.$inferSelect;
export type NewTicketImage = typeof ticketImages.$inferInsert;

// ============================================
// TICKET ACTIVITY LOG TABLE
// ============================================

export const ticketActivityLog = pgTable("ticket_activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TicketActivityLog = typeof ticketActivityLog.$inferSelect;
export type NewTicketActivityLog = typeof ticketActivityLog.$inferInsert;

// ============================================
// TICKET COMMENTS TABLE
// ============================================

export const ticketComments = pgTable("ticket_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TicketComment = typeof ticketComments.$inferSelect;
export type NewTicketComment = typeof ticketComments.$inferInsert;

// ============================================
// NOTIFICATIONS TABLE
// ============================================

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  relatedTicketId: uuid("related_ticket_id").references(() => tickets.id, { onDelete: "cascade" }),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  createdTickets: many(tickets, { relationName: "createdTickets" }),
  assignedTickets: many(tickets, { relationName: "assignedTickets" }),
  activityLogs: many(ticketActivityLog),
  comments: many(ticketComments),
  notifications: many(notifications),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  creator: one(users, {
    fields: [tickets.createdBy],
    references: [users.id],
    relationName: "createdTickets",
  }),
  assignee: one(users, {
    fields: [tickets.assignedTo],
    references: [users.id],
    relationName: "assignedTickets",
  }),
  images: many(ticketImages),
  activityLogs: many(ticketActivityLog),
  comments: many(ticketComments),
  notifications: many(notifications),
}));

export const ticketImagesRelations = relations(ticketImages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketImages.ticketId],
    references: [tickets.id],
  }),
}));

export const ticketActivityLogRelations = relations(ticketActivityLog, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketActivityLog.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketActivityLog.userId],
    references: [users.id],
  }),
}));

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketComments.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketComments.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  relatedTicket: one(tickets, {
    fields: [notifications.relatedTicketId],
    references: [tickets.id],
  }),
}));
