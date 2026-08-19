/**
 * AppError represents a known, "operational" error we deliberately throw
 * (bad input, not found, unauthorized, etc). The central error handler
 * trusts these to have a safe, user-facing message and correct status code.
 * Anything that is NOT an AppError is treated as an unexpected bug and
 * gets a generic 500 response instead of leaking internals.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request"): AppError {
    return new AppError(message, 400);
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(message, 403);
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError(message, 404);
  }

  static conflict(message = "Conflict"): AppError {
    return new AppError(message, 409);
  }
}
