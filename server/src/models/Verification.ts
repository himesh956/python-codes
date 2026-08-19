import { Schema, model, Document, Types } from "mongoose";
import {
  VERIFICATION_TYPES,
  VerificationType,
  VERIFICATION_STATUSES,
  VerificationStatus,
} from "../constants/workerEnums";

export interface IVerification extends Document {
  _id: Types.ObjectId;
  worker: Types.ObjectId;
  type: VerificationType;
  status: VerificationStatus;
  evidenceRef?: string; // Cloudinary URL for ID doc, or skill-test result reference
  verifiedAt?: Date;
  reviewedBy?: Types.ObjectId; // admin User._id, for GOVT_ID manual review
  createdAt: Date;
  updatedAt: Date;
}

/**
 * One document per verification type per worker (not a single
 * "isVerified" boolean on WorkerProfile) so each verification tier —
 * PHONE, GOVT_ID, SKILL_TEST — can be tracked, re-attempted, and
 * audited independently. This directly feeds the Trust Score
 * calculation (Part 3) and the cold-start mechanism (Part 5).
 */
const verificationSchema = new Schema<IVerification>(
  {
    worker: { type: Schema.Types.ObjectId, ref: "WorkerProfile", required: true },
    type: { type: String, enum: VERIFICATION_TYPES, required: true },
    status: { type: String, enum: VERIFICATION_STATUSES, default: "PENDING" },
    evidenceRef: String,
    verifiedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

verificationSchema.index({ worker: 1, type: 1 }, { unique: true });

export const Verification = model<IVerification>("Verification", verificationSchema);