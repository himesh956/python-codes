import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";

/**
 * Rejects malformed MongoDB ObjectIds before they reach a service/
 * query — without this, an invalid id (e.g. "admin' OR '1'='1") falls
 * through to Mongoose, which throws a raw CastError that the error
 * handler already catches, but validating early gives a cleaner 400
 * and avoids depending on Mongoose's error shape for security-relevant
 * input rejection.
 */
export function validateObjectId(paramName: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return next(AppError.badRequest(`Invalid ${paramName}`));
    }
    next();
  };
}