import { Schema, model, Document, Types } from "mongoose";
import { INTERVIEW_MODES, InterviewMode, INTERVIEW_STATUSES, InterviewStatus } from "../constants/enums";

export interface IInterview extends Document {
  _id: Types.ObjectId;
  application: Types.ObjectId;
  candidate: Types.ObjectId;
  job: Types.ObjectId;
  scheduledDate: Date;
  mode: InterviewMode;
  meetingLink?: string;
  interviewer?: string;
  notes?: string;
  status: InterviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * interviews references `application` (not just job+candidate) because
 * an interview only makes sense in the context of a specific application's
 * pipeline — this lets us show interviews directly on the application
 * timeline. `candidate`/`job` are denormalized alongside it purely to
 * avoid an extra lookup when listing "my upcoming interviews".
 */
const interviewSchema = new Schema<IInterview>(
  {
    application: { type: Schema.Types.ObjectId, ref: "Application", required: true },
    candidate: { type: Schema.Types.ObjectId, ref: "CandidateProfile", required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    scheduledDate: { type: Date, required: true },
    mode: { type: String, enum: INTERVIEW_MODES, required: true },
    meetingLink: String,
    interviewer: String,
    notes: String,
    status: { type: String, enum: INTERVIEW_STATUSES, default: "SCHEDULED" },
  },
  { timestamps: true }
);

interviewSchema.index({ candidate: 1, scheduledDate: 1 });
interviewSchema.index({ application: 1 });

export const Interview = model<IInterview>("Interview", interviewSchema);
