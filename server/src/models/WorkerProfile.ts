import { Schema, model, Document, Types } from "mongoose";
import { ILocation, locationSchema } from "./shared/location.schema";
import { AVAILABILITY_STATES, AvailabilityState, WAGE_TYPES, WageType } from "../constants/workerEnums";

interface IWageExpectation {
  type: WageType;
  amount: number;
  currency: string;
}

export interface IWorkerProfile extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  fullName: string;
  photoUrl?: string;
  phone?: string;
  bio?: string;
  categories: Types.ObjectId[];
  experienceYears: number;
  baseLocation: ILocation;
  serviceAreaRadiusKm: number;
  wageExpectation: IWageExpectation;
  availabilityState: AvailabilityState;
  availabilityUpdatedAt: Date;
  trustScore: number;
  isNewWorker: boolean;
  completedJobsCount: number;
  averageRating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const workerProfileSchema = new Schema<IWorkerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    photoUrl: String,
    phone: { type: String, trim: true },
    bio: { type: String, maxlength: 500 },
    categories: [{ type: Schema.Types.ObjectId, ref: "WorkerCategory", required: true }],
    experienceYears: { type: Number, default: 0, min: 0 },
    baseLocation: { type: locationSchema, required: true },
    serviceAreaRadiusKm: { type: Number, default: 5, min: 1, max: 50 },
    wageExpectation: {
      type: { type: String, enum: WAGE_TYPES, required: true },
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "INR" },
    },
    availabilityState: { type: String, enum: AVAILABILITY_STATES, default: "OFFLINE" },
    availabilityUpdatedAt: { type: Date, default: Date.now },
    trustScore: { type: Number, default: 20, min: 0, max: 100 },
    isNewWorker: { type: Boolean, default: true },
    completedJobsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

workerProfileSchema.index({ categories: 1, "baseLocation.city": 1 });
workerProfileSchema.index({ availabilityState: 1 });
workerProfileSchema.index({ trustScore: -1 });
workerProfileSchema.index({ "wageExpectation.amount": 1 });
// Geospatial index — only meaningful for documents that have set
// baseLocation.geoPoint; MongoDB's 2dsphere index simply skips
// documents where the field is absent, so this is safe on partially-
// migrated data.
workerProfileSchema.index({ "baseLocation.geoPoint": "2dsphere" });

export const WorkerProfile = model<IWorkerProfile>("WorkerProfile", workerProfileSchema);