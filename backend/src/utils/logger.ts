import pino from "pino";
import { env } from "../config/env";

/**
 * Centralized logger using Pino
 * Provides structured logging with contextual information
 */
export const logger = pino({
  level: env.nodeEnv === "production" ? "info" : "debug",
  transport:
    env.nodeEnv === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
            singleLine: false,
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: env.nodeEnv,
  },
});

/**
 * Create a child logger with additional context
 * Useful for adding request-specific or module-specific context
 */
export const createContextLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

/**
 * Logger for HTTP requests
 * Adds request-specific context
 */
export const createRequestLogger = (
  method: string,
  url: string,
  requestId: string
) => {
  return logger.child({
    requestId,
    method,
    url,
    type: "http",
  });
};

/**
 * Logger for database operations
 */
export const dbLogger = logger.child({ module: "database" });

/**
 * Logger for authentication operations
 */
export const authLogger = logger.child({ module: "auth" });

/**
 * Logger for service layer
 */
export const serviceLogger = logger.child({ module: "service" });

/**
 * Log successful operations with duration
 */
export const logSuccess = (
  logger: pino.Logger,
  message: string,
  duration?: number,
  data?: Record<string, any>
) => {
  logger.info(
    {
      ...data,
      duration: duration ? `${duration}ms` : undefined,
    },
    message
  );
};

/**
 * Log errors with context
 */
export const logError = (
  logger: pino.Logger,
  message: string,
  error: Error,
  context?: Record<string, any>
) => {
  logger.error(
    {
      ...context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    },
    message
  );
};
