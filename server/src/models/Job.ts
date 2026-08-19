import { Schema, model, Document, Types } from "mongoose";
import {
  EMPLOYMENT_TYPES,
  EmploymentType,
  WORK_MODES,
  WorkMode,
  JOB_STATUSES,
  JobStatus,
} from "../constants/enums";
import { ILocation, locationSchema } from "./shared/location.schema";

export interface IJob extends Document {
  _id: Types.ObjectId;
  employer: Types.ObjectId;
  company: Types.ObjectId;
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  experienceMinYears: number;
  experienceMaxYears?: number;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location: ILocation;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  openings: number;
  applicationDeadline?: Date;
  status: JobStatus;
  benefits: string[];
  educationRequirements?: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * jobs is the central listing collection. `salaryMin`/`salaryMax` are
 * stored as plain numbers (Part 61 — CTC normalization) so analytics
 * (avg CTC by role/location) can run as MongoDB aggregations instead
 * of parsing strings. `status` drives the lifecycle
 * (DRAFT -> PUBLISHED -> PAUSED/CLOSED/EXPIRED); jobs are never hard
 * deleted so existing applications keep valid references (Part 59).
 */
const jobSchema = new Schema<IJob>(
  {
    employer: { type: Schema.Types.ObjectId, ref: "EmployerProfile", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [], required: true },
    experienceMinYears: { type: Number, default: 0, min: 0 },
    experienceMaxYears: { type: Number, min: 0 },
    employmentType: { type: String, enum: EMPLOYMENT_TYPES, required: true },
    workMode: { type: String, enum: WORK_MODES, required: true },
    location: { type: locationSchema, required: true },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    salaryCurrency: { type: String, default: "INR" },
    openings: { type: Number, default: 1, min: 1 },
    applicationDeadline: Date,
    status: { type: String, enum: JOB_STATUSES, default: "DRAFT" },
    benefits: { type: [String], default: [] },
    educationRequirements: String,
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Full-text search across title + description.
jobSchema.index({ title: "text", description: "text" });
// Hot path: browsing published jobs in a location, newest first.
jobSchema.index({ status: 1, "location.city": 1, createdAt: -1 });
// Skill-based search/filtering and matching engine.
jobSchema.index({ skills: 1 });
// Salary-range filters and sort.
jobSchema.index({ salaryMin: 1, salaryMax: 1 });
// Employer's own job list (dashboard).
jobSchema.index({ employer: 1, status: 1 });

export const Job = model<IJob>("Job", jobSchema);
