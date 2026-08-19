import { Schema, model, Document, Types } from "mongoose";

export interface ISkillQuizAttempt extends Document {
  _id: Types.ObjectId;
  worker: Types.ObjectId;
  quiz: Types.ObjectId;
  score: number;
  passed: boolean;
  answeredAt: Date;
}

/**
 * Kept as its own log (not just a pass/fail flag on Verification) so a
 * worker's quiz history is auditable and re-attempts are trackable —
 * useful if abuse patterns emerge (e.g. someone retrying rapidly to
 * guess answers) without needing to build that detection at MVP.
 */
const skillQuizAttemptSchema = new Schema<ISkillQuizAttempt>({
  worker: { type: Schema.Types.ObjectId, ref: "WorkerProfile", required: true },
  quiz: { type: Schema.Types.ObjectId, ref: "SkillQuiz", required: true },
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  answeredAt: { type: Date, default: Date.now },
});

skillQuizAttemptSchema.index({ worker: 1, quiz: 1, answeredAt: -1 });

export const SkillQuizAttempt = model<ISkillQuizAttempt>("SkillQuizAttempt", skillQuizAttemptSchema);