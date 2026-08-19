import { Schema, model, Document, Types } from "mongoose";

export interface ISkill extends Document {
  _id: Types.ObjectId;
  name: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * skills is a normalized master list. Jobs and candidate profiles both
 * store skill *names* directly (denormalized, for query simplicity),
 * but this collection exists so we have one canonical, deduplicated
 * source of truth for autocomplete and for analytics like "Top Skills"
 * — without it, "React", "ReactJS", "react.js" would fragment counts.
 */
const skillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Skill = model<ISkill>("Skill", skillSchema);
