import { Schema, model, Document, Types } from "mongoose";

export interface ISavedJob extends Document {
  _id: Types.ObjectId;
  candidate: Types.ObjectId;
  job: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * savedJobs is a lightweight join table. Kept separate from
 * CandidateProfile (rather than an array field on it) so saving/
 * unsaving doesn't require rewriting the whole profile document,
 * and so the unique compound index can cheaply prevent duplicate saves.
 */
const savedJobSchema = new Schema<ISavedJob>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "CandidateProfile", required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  },
  { timestamps: true }
);

savedJobSchema.index({ candidate: 1, job: 1 }, { unique: true });

export const SavedJob = model<ISavedJob>("SavedJob", savedJobSchema);
