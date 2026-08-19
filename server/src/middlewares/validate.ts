import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

/**
 * Validates req.{body,query,params} against a Zod schema shaped as
 * { body?, query?, params? }. On failure the ZodError is passed to
 * next() where the centralized error handler formats field-level
 * messages — no controller does its own validation.
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Write coerced/defaulted values back (e.g. Zod turning query
      // string "2" into number 2, or applying a default) so
      // controllers can trust req.body/query/params after this point.
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);
      next();
    } catch (err) {
      next(err);
    }
  };
}
