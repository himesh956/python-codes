import { Schema, model, Document, Types } from "mongoose";
import { APPLICATION_STATUSES, ApplicationStatus } from "../constants/enums";

interface IStatusHistoryEntry {
  status: ApplicationStatus;
  changedAt: Date;
  note?: string;
}

export interface IApplication extends Document {
  _id: Types.ObjectId;
  candidate: Types.ObjectId;
  job: Types.ObjectId;
  employer: Types.ObjectId;
  company: Types.ObjectId;
  resume: Types.ObjectId;
  status: ApplicationStatus;
  statusHistory: IStatusHistoryEntry[];
  recruiterNotes?: string;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * applications is the join between candidate and job, plus the full
 * hiring pipeline state. `employer`/`company` are denormalized onto
 * the document (not just derivable via `job`) so employer-side
 * queries ("all applications for my company") don't need a lookup
 * into jobs first. The compound unique index on (candidate, job)
 * is what actually prevents duplicate applications at the DB level —
 * application-layer checks alone are not enough under race conditions.
 */
const applicationSchema = new Schema<IApplication>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "CandidateProfile", required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    employer: { type: Schema.Types.ObjectId, ref: "EmployerProfile", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    resume: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    status: { type: String, enum: APPLICATION_STATUSES, default: "APPLIED" },
    statusHistory: [
      {
        status: { type: String, enum: APPLICATION_STATUSES, required: true },
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    recruiterNotes: String,
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevents duplicate applications (Part 12) — enforced at the DB level.
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });
// Candidate's "my applications" list, newest first.
applicationSchema.index({ candidate: 1, createdAt: -1 });
// Employer's applicant list per job, filterable by status.
applicationSchema.index({ job: 1, status: 1 });
// Analytics: funnel/time-series queries scan by status + date.
applicationSchema.index({ status: 1, createdAt: -1 });

export const Application = model<IApplication>("Application", applicationSchema);
