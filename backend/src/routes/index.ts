import { Router } from "express";
import { healthRouter } from "./health.routes";
import authRoutes from "./auth.routes";
import ticketRoutes from "./ticket.routes";
import userRoutes from "./user.routes";
import notificationRoutes from "./notification.routes";
import dashboardRoutes from "./dashboard.routes";

const apiRouter = Router();

// Health check
apiRouter.use(healthRouter);

// API routes
apiRouter.use("/auth", authRoutes);
apiRouter.use("/tickets", ticketRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/dashboard", dashboardRoutes);

export { apiRouter };
