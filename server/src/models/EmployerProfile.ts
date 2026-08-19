import { Schema, model, Document, Types } from "mongoose";

export interface IEmployerProfile extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  company: Types.ObjectId;
  fullName: string;
  designation?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * employerProfiles links a User(role=EMPLOYER) to the Company they
 * represent. Kept separate from Company so multiple recruiter accounts
 * could belong to one company later without changing the Company schema.
 */
const employerProfileSchema = new Schema<IEmployerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    fullName: { type: String, required: true, trim: true },
    designation: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

employerProfileSchema.index({ company: 1 });

export const EmployerProfile = model<IEmployerProfile>(
  "EmployerProfile",
  employerProfileSchema
);
