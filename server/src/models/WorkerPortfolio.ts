import { Schema, model, Document, Types } from "mongoose";

export interface IWorkerPortfolioItem extends Document {
  _id: Types.ObjectId;
  worker: Types.ObjectId;
  imageUrl: string;
  cloudinaryPublicId: string;
  caption?: string;
  isPlatformVerified: boolean; // false = worker-provided, true = tied to a completed on-platform Booking
  linkedBooking?: Types.ObjectId | null;
  createdAt: Date;
}

/**
 * The visual distinction from the product plan (Part 5): a photo the
 * worker uploaded themselves ("Worker-provided portfolio") is shown
 * differently from a photo tied to an actual completed platform
 * booking ("Platform-verified job"). isPlatformVerified is what drives
 * that UI distinction — never conflate the two levels of trust.
 */
const workerPortfolioSchema = new Schema<IWorkerPortfolioItem>(
  {
    worker: { type: Schema.Types.ObjectId, ref: "WorkerProfile", required: true },
    imageUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    caption: { type: String, maxlength: 200 },
    isPlatformVerified: { type: Boolean, default: false },
    linkedBooking: { type: Schema.Types.ObjectId, ref: "Booking", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

workerPortfolioSchema.index({ worker: 1, createdAt: -1 });

export const WorkerPortfolio = model<IWorkerPortfolioItem>("WorkerPortfolio", workerPortfolioSchema);