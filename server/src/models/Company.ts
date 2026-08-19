import { Schema, model, Document, Types } from "mongoose";
import { ILocation, locationSchema } from "./shared/location.schema";

export interface ICompany extends Document {
  _id: Types.ObjectId;
  name: string;
  logoUrl?: string;
  about?: string;
  industry?: string;
  website?: string;
  locations: ILocation[];
  createdBy: Types.ObjectId;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * companies is separate from employerProfiles because one company can
 * have multiple employer/recruiter users under it in the future
 * (e.g. HR team). For now one employer typically creates one company,
 * but modeling it as its own collection avoids a costly migration later.
 */
const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: String,
    about: { type: String, maxlength: 2000 },
    industry: { type: String, trim: true },
    website: String,
    locations: { type: [locationSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

companySchema.index({ name: "text" });

export const Company = model<ICompany>("Company", companySchema);
