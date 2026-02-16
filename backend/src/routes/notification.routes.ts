import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

// List notifications
router.get("/", notificationController.list);

// Get unread count
router.get("/unread/count", notificationController.getUnreadCount);

// Mark notification as read
router.patch("/:id/read", notificationController.markAsRead);

// Mark all notifications as read (support both PATCH and POST for frontend compatibility)
router.patch("/read-all", notificationController.markAllAsRead);
router.post("/mark-all-read", notificationController.markAllAsRead);

export default router;
