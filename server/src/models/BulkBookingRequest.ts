import { Schema, model, Document, Types } from "mongoose";
import { BULK_REQUEST_STATUSES, BulkRequestStatus } from "../constants/businessEnums";
import { WageType, WAGE_TYPES } from "../constants/workerEnums";

export interface IBulkBookingRequest extends Document {
  _id: Types.ObjectId;
  business: Types.ObjectId; // User._id, flagged as a business account
  category: Types.ObjectId;
  quantityNeeded: number;
  quantityFilled: number;
  requestedFor: Date;
  agreedWage: { type: WageType; amount: number; currency: string };
  location: { city: string; addressNote?: string };
  status: BulkRequestStatus;
  filledByBookings: Types.ObjectId[]; // individual Booking docs created as workers accept
  isRecurring: boolean;
  recurrencePattern?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A BulkBookingRequest represents "I need N workers of category X" —
 * distinct from a single Booking (Part 11 of the product plan: "one-
 * at-a-time booking flow doesn't fit their need"). Filling it creates
 * individual Booking documents under the hood (one per accepted
 * worker), reusing all existing booking-lifecycle logic rather than
 * duplicating status pipelines — filledByBookings just tracks which
 * ones belong to this bulk request.
 */
const bulkBookingRequestSchema = new Schema<IBulkBookingRequest>(
  {
    business: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: Schema.Types.ObjectId, ref: "WorkerCategory", required: true },
    quantityNeeded: { type: Number, required: true, min: 1 },
    quantityFilled: { type: Number, default: 0 },
    requestedFor: { type: Date, required: true },
    agreedWage: {
      type: { type: String, enum: WAGE_TYPES, required: true },
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "INR" },
    },
    location: {
      city: { type: String, required: true },
      addressNote: String,
    },
    status: { type: String, enum: BULK_REQUEST_STATUSES, default: "OPEN" },
    filledByBookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: { type: String },
  },
  { timestamps: true }
);

bulkBookingRequestSchema.index({ business: 1, createdAt: -1 });
bulkBookingRequestSchema.index({ category: 1, status: 1, "location.city": 1 });

export const BulkBookingRequest = model<IBulkBookingRequest>(
  "BulkBookingRequest",
  bulkBookingRequestSchema
);