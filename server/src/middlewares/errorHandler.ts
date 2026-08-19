import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

/**
 * Single place where every error in the app ends up. Controllers never
 * format error JSON themselves — they just `next(err)` or throw inside
 * an async handler wrapped by `catchAsync` (added in a later phase).
 *
 * Rules enforced here:
 * - Known AppErrors -> use their statusCode + message as-is.
 * - Zod validation errors -> 400 with field-level details.
 * - Mongoose duplicate key errors -> 409 conflict.
 * - Mongoose cast errors (bad ObjectId etc) -> 400.
 * - Anything else (a real bug) -> 500 with a generic message.
 *   Full details are logged server-side, never sent to the client,
 *   and stack traces are never included in production responses.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // eslint-disable-next-line no-console
  console.error(`[error] ${req.method} ${req.originalUrl} ->`, err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid value for field "${err.path}"`,
    });
    return;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  ) {
    res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: env.isProduction
      ? "Something went wrong. Please try again later."
      : err instanceof Error
        ? err.message
        : "Unknown error",
    ...(env.isProduction ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
}
