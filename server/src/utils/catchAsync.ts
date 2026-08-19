import { NextFunction, Request, Response } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async controller so any rejected promise (including a thrown
 * AppError) is forwarded to `next()` and handled by the centralized
 * error handler, instead of every controller needing its own try/catch.
 */
export function catchAsync(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
