import { Request, Response, NextFunction } from "express";
import { ticketService } from "../services/ticket.service";
import {
  createTicketSchema,
  updateTicketSchema,
  addCommentSchema,
  addImagesSchema,
  ticketFiltersSchema,
} from "../validators/ticket.validator";

export const ticketController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const filters = ticketFiltersSchema.parse(req.query);
      const result = await ticketService.listTickets(
        req.user.userId,
        req.user.role,
        filters
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      const result = await ticketService.getTicket(id, req.user.userId, req.user.role);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const input = createTicketSchema.parse(req.body);
      const result = await ticketService.createTicket(input, req.user.userId);

      res.status(201).json({
        success: true,
        message: "Ticket created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      const input = updateTicketSchema.parse(req.body);
      const result = await ticketService.updateTicket(
        id,
        input,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        message: "Ticket updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      const input = addCommentSchema.parse(req.body);
      const result = await ticketService.addComment(id, input, req.user.userId);

      res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async addImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      const input = addImagesSchema.parse(req.body);
      const result = await ticketService.addImages(id, input, req.user.userId);

      res.status(201).json({
        success: true,
        message: "Images added successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async assignTicket(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      const { technicianId } = req.body;

      if (!technicianId) {
        return res.status(400).json({ success: false, message: "technicianId is required" });
      }

      const result = await ticketService.assignTicket(
        id,
        technicianId,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        message: "Ticket assigned successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: "status is required" });
      }

      const validStatuses = ["open", "assigned", "in_progress", "done"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      }

      const result = await ticketService.updateTicketStatus(
        id,
        status,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        message: "Ticket status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteTicket(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      await ticketService.deleteTicket(id, req.user.userId, req.user.role);

      res.status(200).json({
        success: true,
        message: "Ticket deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
