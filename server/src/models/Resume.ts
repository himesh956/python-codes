import { Schema, model, Document, Types } from "mongoose";

export interface IResume extends Document {
  _id: Types.ObjectId;
  candidate: Types.ObjectId;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * resumes is separate from candidateProfiles so we retain metadata
 * (size, original filename, Cloudinary public id for deletion) without
 * bloating the profile document, and so an application can reference
 * a specific resume snapshot at the time of applying (Part 12/61 spirit:
 * applications should record what was true at apply-time).
 */
const resumeSchema = new Schema<IResume>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "CandidateProfile", required: true },
    cloudinaryUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

resumeSchema.index({ candidate: 1, createdAt: -1 });

export const Resume = model<IResume>("Resume", resumeSchema);
