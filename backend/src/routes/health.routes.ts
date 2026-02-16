import { Router } from "express";
import { healthController } from "../controllers/health.controller";

const healthRouter = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check API health status
 *     responses:
 *       200:
 *         description: API is healthy
 */
healthRouter.get("/health", healthController.getHealth);

export { healthRouter };
