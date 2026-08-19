import { Schema, model, Document, Types } from "mongoose";

export type ReportTargetType = "USER" | "JOB" | "WORKER_PROFILE";
export type ReportReason =
  | "FAKE_PROFILE"
  | "INAPPROPRIATE_BEHAVIOR"
  | "SCAM_OR_FRAUD"
  | "SPAM"
  | "OTHER";
export type ReportStatus = "OPEN" | "REVIEWED" | "DISMISSED";

export interface IReport extends Document {
  _id: Types.ObjectId;
  reportedBy: Types.ObjectId;
  targetType: ReportTargetType;
  targetId: Types.ObjectId;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  reviewedBy?: Types.ObjectId;
  createdAt: Date;
}

/**
 * Generic "report this user/job/profile" — distinct from Dispute
 * (which is booking-specific, has a resolution workflow with financial/
 * work-quality implications) and distinct from Review.isReported
 * (which is specifically about a review's content). This model covers
 * Phase 10's "Report user / Report job" requirements broadly.
 */
const reportSchema = new Schema<IReport>(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["USER", "JOB", "WORKER_PROFILE"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: ["FAKE_PROFILE", "INAPPROPRIATE_BEHAVIOR", "SCAM_OR_FRAUD", "SPAM", "OTHER"],
      required: true,
    },
    details: { type: String, maxlength: 500 },
    status: { type: String, enum: ["OPEN", "REVIEWED", "DISMISSED"], default: "OPEN" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

export const Report = model<IReport>("Report", reportSchema);