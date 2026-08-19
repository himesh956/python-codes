import { Schema, model, Document, Types } from "mongoose";

interface IQuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface ISkillQuiz extends Document {
  _id: Types.ObjectId;
  category: Types.ObjectId;
  questions: IQuizQuestion[];
  passingScore: number; // out of questions.length
  isActive: boolean;
  createdAt: Date;
}

/**
 * A short, category-specific quiz — NOT full certification, per the
 * explicit MVP scoping in Part 5/9 of the product plan ("this is NOT
 * a full certification; it's a friction-reducing signal that this
 * person at least knows the vocabulary/basics of the trade"). One
 * quiz per category, admin-authored.
 */
const skillQuizSchema = new Schema<ISkillQuiz>(
  {
    category: { type: Schema.Types.ObjectId, ref: "WorkerCategory", required: true, unique: true },
    questions: [
      {
        question: { type: String, required: true },
        options: { type: [String], required: true },
        correctOptionIndex: { type: Number, required: true },
      },
    ],
    passingScore: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SkillQuiz = model<ISkillQuiz>("SkillQuiz", skillQuizSchema);