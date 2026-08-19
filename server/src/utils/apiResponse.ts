import { Response } from "express";

interface SuccessPayload<T> {
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

/**
 * Every successful response in LOCALHIRE follows the same shape:
 * { success: true, message, data, meta }
 * Errors follow the mirrored shape produced by the central error handler.
 * Keeping this in one place means no controller ever invents its own format.
 */
export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  { message = "Success", data, meta }: SuccessPayload<T> = {}
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    meta: meta ?? undefined,
  });
}
