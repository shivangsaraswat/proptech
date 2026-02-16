import type { Request, Response } from "express";

export const healthController = {
  getHealth(_req: Request, res: Response) {
    res.status(200).json({
      ok: true,
      message: "Backend is running",
      timestamp: new Date().toISOString(),
    });
  },
};
