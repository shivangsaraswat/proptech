import cors from "cors";
import { env } from "./config/env";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { apiRouter } from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/request-logger.middleware";

export const app = express();

// CORS Configuration
const corsOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : [];

app.use(
    cors({
        origin: corsOrigins.length > 0 ? corsOrigins : true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());

// Request logging middleware (should be before routes)
app.use(requestLogger);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", apiRouter);

app.use(errorMiddleware);
