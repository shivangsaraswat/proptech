import { Request, Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const stats = await dashboardService.getStats(req.user.userId, req.user.role);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};
