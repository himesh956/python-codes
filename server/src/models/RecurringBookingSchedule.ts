import { Schema, model, Document, Types } from "mongoose";
import { RECURRENCE_PATTERNS, RecurrencePattern } from "../constants/businessEnums";
import { WageType, WAGE_TYPES } from "../constants/workerEnums";

export interface IRecurringBookingSchedule extends Document {
  _id: Types.ObjectId;
  customer: Types.ObjectId;
  worker: Types.ObjectId;
  category: Types.ObjectId;
  pattern: RecurrencePattern;
  dayOfWeek: number; // 0-6, used for WEEKLY/BIWEEKLY
  timeOfDay: string; // "HH:mm", local time interpretation kept simple at MVP
  agreedWage: { type: WageType; amount: number; currency: string };
  location: { city: string; addressNote?: string };
  isActive: boolean;
  lastGeneratedAt?: Date;
  nextRunAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A standing instruction ("book this worker every weekend") that
 * generates real Booking documents on schedule — the schedule itself
 * is not a booking. nextRunAt drives the generator job (see
 * recurringBooking.service.ts) so it's a simple indexed query, not a
 * full cron-expression parser at MVP.
 */
const recurringBookingScheduleSchema = new Schema<IRecurringBookingSchedule>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    worker: { type: Schema.Types.ObjectId, ref: "WorkerProfile", required: true },
    category: { type: Schema.Types.ObjectId, ref: "WorkerCategory", required: true },
    pattern: { type: String, enum: RECURRENCE_PATTERNS, required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    timeOfDay: { type: String, required: true },
    agreedWage: {
      type: { type: String, enum: WAGE_TYPES, required: true },
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "INR" },
    },
    location: {
      city: { type: String, required: true },
      addressNote: String,
    },
    isActive: { type: Boolean, default: true },
    lastGeneratedAt: Date,
    nextRunAt: { type: Date, required: true },
  },
  { timestamps: true }
);

recurringBookingScheduleSchema.index({ isActive: 1, nextRunAt: 1 });
recurringBookingScheduleSchema.index({ customer: 1 });

export const RecurringBookingSchedule = model<IRecurringBookingSchedule>(
  "RecurringBookingSchedule",
  recurringBookingScheduleSchema
);