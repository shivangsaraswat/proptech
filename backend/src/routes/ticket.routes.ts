import { Router } from "express";
import { ticketController } from "../controllers/ticket.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

// All ticket routes require authentication
router.use(authMiddleware);

// List and create tickets
router.get("/", ticketController.list);
router.post("/", ticketController.create);

// Get specific ticket
router.get("/:id", ticketController.get);

// Update ticket (managers and technicians only)
router.patch(
  "/:id",
  roleMiddleware("manager", "technician"),
  ticketController.update
);

// Add comment (all authenticated users)
router.post("/:id/comments", ticketController.addComment);

// Add images (all authenticated users)
router.post("/:id/images", ticketController.addImages);

export default router;
