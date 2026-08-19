import { Schema, model, Document, Types } from "mongoose";
import { ROLES, Role } from "../constants/roles";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  refreshTokenHash?: string | null;
  passwordResetTokenHash?: string | null;
  passwordResetExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * users is the single auth identity table for every role (Candidate,
 * Employer, Admin). Role-specific data lives in separate profile
 * collections (candidateProfiles / employerProfiles) referencing
 * this _id — keeping auth concerns separate from profile concerns.
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned by default queries
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

// email already has a unique index via `unique: true` above.
userSchema.index({ role: 1 });

export const User = model<IUser>("User", userSchema);
