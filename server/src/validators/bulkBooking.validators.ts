import { z } from "zod";
import { WAGE_TYPES } from "../constants/workerEnums";
import { RECURRENCE_PATTERNS } from "../constants/businessEnums";

export const createBulkRequestSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1),
    quantityNeeded: z.number().int().min(1).max(50),
    requestedFor: z.coerce.date(),
    agreedWage: z.object({
      type: z.enum(WAGE_TYPES),
      amount: z.number().min(0),
    }),
    location: z.object({
      city: z.string().min(1),
      addressNote: z.string().max(300).optional(),
    }),
  }),
});

export const createRecurringScheduleSchema = z.object({
  body: z.object({
    workerId: z.string().min(1),
    categoryId: z.string().min(1),
    pattern: z.enum(RECURRENCE_PATTERNS),
    dayOfWeek: z.number().int().min(0).max(6),
    timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm format"),
    agreedWage: z.object({
      type: z.enum(WAGE_TYPES),
      amount: z.number().min(0),
    }),
    location: z.object({
      city: z.string().min(1),
      addressNote: z.string().max(300).optional(),
    }),
  }),
});