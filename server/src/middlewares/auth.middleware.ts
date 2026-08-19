import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt";
import { Role } from "../constants/roles";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: Role;
  };
}

/**
 * Reads the access token from the Authorization header
 * ("Bearer <token>"), verifies it, and attaches { id, role } to
 * req.user. Every protected route runs this first.
 */
export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(AppError.unauthorized("Authentication token missing"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired token"));
  }
}

/**
 * Restricts a route to specific roles. Must run after `authenticate`.
 * Usage: router.post("/jobs", authenticate, authorize("EMPLOYER"), ...)
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized("Authentication required"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden("You do not have permission to perform this action"));
    }
    next();
  };
}
