import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Dashboard stats (all authenticated users)
router.get("/stats", authMiddleware, dashboardController.getStats);

export default router;
