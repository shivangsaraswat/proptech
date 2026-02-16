import type { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";

export const userController = {
  async listTechnicians(req: Request, res: Response, next: NextFunction) {
    try {
      const technicians = await userService.listTechnicians();

      res.status(200).json({
        success: true,
        data: technicians,
      });
    } catch (error) {
      next(error);
    }
  },
};
