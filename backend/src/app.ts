import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { apiRouter } from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/request-logger.middleware";

export const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware (should be before routes)
app.use(requestLogger);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", apiRouter);

app.use(errorMiddleware);
