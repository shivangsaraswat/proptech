import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

// List technicians (managers only - for assignment)
router.get(
  "/technicians",
  authMiddleware,
  roleMiddleware("manager"),
  userController.listTechnicians
);

export default router;

