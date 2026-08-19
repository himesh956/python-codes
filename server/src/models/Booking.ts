import { Schema, model, Document, Types } from "mongoose";
import { BOOKING_STATUSES, BookingStatus, WageType, WAGE_TYPES } from "../constants/workerEnums";

interface IBookingStatusHistoryEntry {
  status: BookingStatus;
  changedAt: Date;
  note?: string;
}

export interface IBooking extends Document {
  _id: Types.ObjectId;
  customer: Types.ObjectId; // User._id — the person hiring
  worker: Types.ObjectId; // WorkerProfile._id
  category: Types.ObjectId;
  isUrgent: boolean;
  requestedFor: Date; // when the work is needed (now-ish for urgent, future for scheduled)
  respondBy?: Date; // accept/decline timer deadline, set only for urgent requests
  status: BookingStatus;
  statusHistory: IBookingStatusHistoryEntry[];
  agreedWage: { type: WageType; amount: number; currency: string };
  location: { city: string; state?: string; addressNote?: string };
  isRepeatBooking: boolean; // true if customer has a prior COMPLETED booking with this worker
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking is the worker-marketplace equivalent of Application, but the
 * flow is inverted: the CUSTOMER initiates (unlike a candidate applying
 * to a job, here the "job" doesn't pre-exist — the customer requests a
 * specific worker directly). statusHistory mirrors the proven
 * Application.statusHistory pattern intentionally — same design,
 * different domain. respondBy powers the accept/decline timer from
 * the Availability-First Hiring flow (Part 7 of the product plan).
 */
const bookingSchema = new Schema<IBooking>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    worker: { type: Schema.Types.ObjectId, ref: "WorkerProfile", required: true },
    category: { type: Schema.Types.ObjectId, ref: "WorkerCategory", required: true },
    isUrgent: { type: Boolean, default: false },
    requestedFor: { type: Date, required: true },
    respondBy: { type: Date },
    status: { type: String, enum: BOOKING_STATUSES, default: "REQUESTED" },
    statusHistory: [
      {
        status: { type: String, enum: BOOKING_STATUSES, required: true },
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    agreedWage: {
      type: { type: String, enum: WAGE_TYPES, required: true },
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "INR" },
    },
    location: {
      city: { type: String, required: true },
      state: String,
      addressNote: String,
    },
    isRepeatBooking: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Worker's incoming requests, newest first.
bookingSchema.index({ worker: 1, status: 1, createdAt: -1 });
// Customer's "my bookings" list.
bookingSchema.index({ customer: 1, createdAt: -1 });
// Repeat-hire lookups: "has this customer booked this worker before".
bookingSchema.index({ customer: 1, worker: 1 });
// Analytics: category-wise demand, funnel-style queries.
bookingSchema.index({ category: 1, status: 1, createdAt: -1 });

export const Booking = model<IBooking>("Booking", bookingSchema);