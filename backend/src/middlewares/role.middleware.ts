import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error";

type UserRole = "tenant" | "manager" | "technician";

export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(
        ApiError.forbidden(`Access denied. Required roles: ${allowedRoles.join(", ")}`)
      );
    }

    next();
  };
};
