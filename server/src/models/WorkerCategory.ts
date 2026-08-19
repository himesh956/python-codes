import { Schema, model, Document, Types } from "mongoose";

export interface IWorkerCategory extends Document {
  _id: Types.ObjectId;
  name: string;
  parentCategory?: Types.ObjectId | null;
  icon?: string;
  requiresSkillTest: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin-managed taxonomy — deliberately NOT user-generated free text.
 * The existing Job.skills field already shows the fragmentation
 * problem ("Electrican" vs "electrician" vs "Electrician "); a fixed
 * category list keeps search/filter/wage-aggregation reliable.
 * parentCategory allows subcategories (e.g. "Mechanic" -> "Two-wheeler
 * Mechanic") without a separate collection.
 */
const workerCategorySchema = new Schema<IWorkerCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    parentCategory: { type: Schema.Types.ObjectId, ref: "WorkerCategory", default: null },
    icon: { type: String },
    requiresSkillTest: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

workerCategorySchema.index({ parentCategory: 1 });

export const WorkerCategory = model<IWorkerCategory>("WorkerCategory", workerCategorySchema);