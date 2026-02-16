import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

// List notifications
router.get("/", notificationController.list);

// Mark notification as read
router.patch("/:id/read", notificationController.markAsRead);

// Mark all notifications as read
router.patch("/read-all", notificationController.markAllAsRead);

export default router;
