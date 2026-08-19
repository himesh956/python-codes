import { Schema, model, Document, Types } from "mongoose";
import { DISPUTE_STATUSES, DisputeStatus, DISPUTE_CATEGORIES, DisputeCategory } from "../constants/workerEnums";

export interface IDispute extends Document {
  _id: Types.ObjectId;
  booking: Types.ObjectId;
  raisedBy: Types.ObjectId;
  category: DisputeCategory;
  reason: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  adminResolution?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new Schema<IDispute>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, enum: DISPUTE_CATEGORIES, default: "OTHER" },
    reason: { type: String, required: true, maxlength: 1000 },
    evidenceUrls: { type: [String], default: [] },
    status: { type: String, enum: DISPUTE_STATUSES, default: "OPEN" },
    adminResolution: { type: String, maxlength: 1000 },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: Date,
  },
  { timestamps: true }
);

disputeSchema.index({ status: 1, createdAt: -1 });
disputeSchema.index({ booking: 1 });

export const Dispute = model<IDispute>("Dispute", disputeSchema);