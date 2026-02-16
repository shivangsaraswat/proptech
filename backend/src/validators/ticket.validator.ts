import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  unitNumber: z.string().max(50).optional(),
  building: z.string().max(255).optional(),
  imageUrls: z.array(z.string().url("Invalid image URL")).optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(["open", "assigned", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  unitNumber: z.string().max(50).optional(),
  building: z.string().max(255).optional(),
  assignedTo: z.string().uuid("Invalid user ID").optional().nullable(),
});

export const addCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

export const addImagesSchema = z.object({
  imageUrls: z.array(z.string().url("Invalid image URL")).min(1, "At least one image required"),
});

export const ticketFiltersSchema = z.object({
  status: z.enum(["open", "assigned", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type AddImagesInput = z.infer<typeof addImagesSchema>;
export type TicketFiltersInput = z.infer<typeof ticketFiltersSchema>;
