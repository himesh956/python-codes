import { Schema, model, Document, Types } from "mongoose";

interface ITrustScoreBreakdown {
  verificationPoints: number;
  ratingPoints: number;
  completedJobsPoints: number;
  reliabilityPoints: number;
  penaltyPoints: number;
}

export interface ITrustScoreSnapshot extends Document {
  _id: Types.ObjectId;
  worker: Types.ObjectId;
  score: number;
  breakdown: ITrustScoreBreakdown;
  computedAt: Date;
}

/**
 * Stored as an append-only log, not just a live field on WorkerProfile
 * (which also keeps a denormalized `trustScore` cache for fast reads).
 * This snapshot history is what makes "why did my score drop" and
 * dispute-related score questions answerable — a design requirement
 * called out explicitly in the product rethink (Part 3/15).
 */
const trustScoreSnapshotSchema = new Schema<ITrustScoreSnapshot>({
  worker: { type: Schema.Types.ObjectId, ref: "WorkerProfile", required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  breakdown: {
    verificationPoints: { type: Number, required: true },
    ratingPoints: { type: Number, required: true },
    completedJobsPoints: { type: Number, required: true },
    reliabilityPoints: { type: Number, required: true },
    penaltyPoints: { type: Number, required: true },
  },
  computedAt: { type: Date, default: Date.now },
});

trustScoreSnapshotSchema.index({ worker: 1, computedAt: -1 });

export const TrustScoreSnapshot = model<ITrustScoreSnapshot>(
  "TrustScoreSnapshot",
  trustScoreSnapshotSchema
);