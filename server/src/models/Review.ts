import { Schema, model, Document, Types } from "mongoose";
import { REVIEWER_ROLES, ReviewerRole } from "../constants/workerEnums";

export interface IReview extends Document {
  _id: Types.ObjectId;
  booking: Types.ObjectId;
  worker: Types.ObjectId;
  customer: Types.ObjectId;
  reviewerRole: ReviewerRole;
  rating: number;
  comment?: string;
  tags: string[]; // WORKER_RATING_TAGS or CUSTOMER_RATING_TAGS depending on reviewerRole
  isReported: boolean;
  createdAt: Date;
}

/**
 * tags validated against the correct fixed list (worker tags vs
 * customer tags) in review.service.ts based on reviewerRole — kept as
 * a plain string array here rather than two separate schema paths to
 * avoid duplicating the review model. isReported supports the "report
 * inappropriate review" requirement (Phase 5) without needing a
 * separate Report entity just for this one case — a review report is
 * simple enough to be a flag, unlike user/job reports which need more
 * structure (see Report model below).
 */
const reviewSchema = new Schema<IReview>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    worker: { type: Schema.Types.ObjectId, ref: "WorkerProfile", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewerRole: { type: String, enum: REVIEWER_ROLES, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    tags: { type: [String], default: [] },
    isReported: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

reviewSchema.index({ booking: 1, reviewerRole: 1 }, { unique: true });
reviewSchema.index({ worker: 1, createdAt: -1 });

export const Review = model<IReview>("Review", reviewSchema);