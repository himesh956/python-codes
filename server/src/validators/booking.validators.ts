import { z } from "zod";
import { WAGE_TYPES, BOOKING_STATUSES } from "../constants/workerEnums";

export const createBookingSchema = z.object({
  body: z.object({
    workerId: z.string().min(1),
    categoryId: z.string().min(1),
    isUrgent: z.boolean().default(false),
    requestedFor: z.coerce.date(),
    agreedWage: z.object({
      type: z.enum(WAGE_TYPES),
      amount: z.number().min(0),
    }),
    location: z.object({
      city: z.string().min(1),
      state: z.string().optional(),
      addressNote: z.string().max(300).optional(),
    }),
  }),
});

export const respondToBookingSchema = z.object({
  body: z.object({
    action: z.enum(["ACCEPT", "DECLINE"]),
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(BOOKING_STATUSES),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>["body"];