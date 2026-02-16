import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { createRequestLogger, logSuccess, logError } from "../utils/logger";

/**
 * Extend Express Request to include logger and requestId
 */
declare global {
  namespace Express {
    interface Request {
      logger: any; // Using 'any' to avoid pino type issues, but it's actually pino.Logger
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Request logging middleware
 * Logs incoming requests, adds request context, and logs completion with duration
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate unique request ID
  req.requestId = randomUUID();
  req.startTime = Date.now();

  // Create request-specific logger
  req.logger = createRequestLogger(req.method, req.path, req.requestId);

  // Log incoming request
  req.logger.info(
    {
      body: req.method !== "GET" ? sanitizeBody(req.body) : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    },
    `Incoming request`
  );

  // Capture original end function
  const originalEnd = res.end;
  let responseLogged = false;

  // Override end function to log response
  res.end = function (chunk?: any, encoding?: any, callback?: any): any {
    if (!responseLogged) {
      responseLogged = true;
      const duration = Date.now() - req.startTime;
      const statusCode = res.statusCode;

      if (statusCode >= 500) {
        req.logger.error(
          {
            statusCode,
            duration: `${duration}ms`,
          },
          `Request failed`
        );
      } else if (statusCode >= 400) {
        req.logger.warn(
          {
            statusCode,
            duration: `${duration}ms`,
          },
          `Request completed with client error`
        );
      } else {
        logSuccess(
          req.logger,
          `Request completed`,
          duration,
          { statusCode }
        );
      }
    }

    // Call original end function
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== "object") {
    return body;
  }

  const sensitiveFields = ["password", "token", "secret", "accessToken", "refreshToken"];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }

  return sanitized;
}
