import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { ZodError } from "zod";
import { logError } from "../utils/logger";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Get logger from request or use default console
  const logger = req.logger || console;

  // Handle ApiError
  if (err instanceof ApiError) {
    // Log 5xx as errors, 4xx as warnings
    if (err.statusCode >= 500) {
      logError(logger, "API error", err, {
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
      });
    } else {
      logger.warn(
        {
          statusCode: err.statusCode,
          path: req.path,
          method: req.method,
          error: {
            message: err.message,
            name: err.name,
          },
        },
        "API client error"
      );
    }

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    logError(logger, "Validation error", new Error(JSON.stringify(err.issues)), {
      issues: err.issues,
      path: req.path,
      method: req.method,
    });

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Handle JWT errors
  if (err instanceof Error) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      logger.warn(
        {
          path: req.path,
          method: req.method,
          error: {
            message: err.message,
            name: err.name,
          },
        },
        "JWT authentication error"
      );

      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  }

  // Default error
  if (err instanceof Error) {
    logError(logger, "Unhandled error", err, {
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error(
      {
        error: err,
        path: req.path,
        method: req.method,
      },
      "Unhandled non-Error exception"
    );
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({
    success: false,
    message,
  });
};
