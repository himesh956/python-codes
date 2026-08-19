import { Schema, model, Document, Types } from "mongoose";
import { ILocation, locationSchema } from "./shared/location.schema";

interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  grade?: string;
}

interface IExperience {
  company: string;
  title: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent?: boolean;
  description?: string;
}

interface IProject {
  title: string;
  description?: string;
  link?: string;
  techStack?: string[];
}

interface ICertification {
  name: string;
  issuer?: string;
  issuedAt?: Date;
  credentialUrl?: string;
}

export interface ICandidateProfile extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  fullName: string;
  photoUrl?: string;
  phone?: string;
  bio?: string;
  currentLocation?: ILocation;
  preferredLocations: ILocation[];
  skills: string[];
  education: IEducation[];
  experience: IExperience[];
  projects: IProject[];
  certifications: ICertification[];
  expectedCTC?: number;
  noticePeriodDays?: number;
  jobPreferences: {
    employmentTypes?: string[];
    workModes?: string[];
  };
  resume?: Types.ObjectId | null;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * candidateProfiles holds everything specific to a CANDIDATE user.
 * Split from `users` so auth stays lean and this document can grow
 * (education/experience/projects arrays) without bloating every
 * auth-related query. `skills` is stored denormalized (string[])
 * for fast matching/search/aggregation — `Skill` collection is the
 * canonical list used for validation/autocomplete, not a hard join.
 */
const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    photoUrl: { type: String },
    phone: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 1000 },
    currentLocation: { type: locationSchema },
    preferredLocations: { type: [locationSchema], default: [] },
    skills: { type: [String], default: [] },
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
        grade: String,
      },
    ],
    experience: [
      {
        company: { type: String, required: true },
        title: { type: String, required: true },
        startDate: Date,
        endDate: Date,
        isCurrent: { type: Boolean, default: false },
        description: String,
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: String,
        link: String,
        techStack: [String],
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: String,
        issuedAt: Date,
        credentialUrl: String,
      },
    ],
    expectedCTC: { type: Number, min: 0 },
    noticePeriodDays: { type: Number, min: 0 },
    jobPreferences: {
      employmentTypes: { type: [String], default: [] },
      workModes: { type: [String], default: [] },
    },
    resume: { type: Schema.Types.ObjectId, ref: "Resume", default: null },
    portfolioUrl: String,
    githubUrl: String,
    linkedinUrl: String,
  },
  { timestamps: true }
);

// `user` already unique-indexed above. These support search/recommendation.
candidateProfileSchema.index({ skills: 1 });
candidateProfileSchema.index({ "preferredLocations.city": 1 });

export const CandidateProfile = model<ICandidateProfile>(
  "CandidateProfile",
  candidateProfileSchema
);
