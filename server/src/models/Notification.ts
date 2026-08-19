import { Schema, model, Document, Types } from "mongoose";

export type NotificationType =
  | "APPLICATION_SUBMITTED"
  | "APPLICATION_SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "OFFER_RECEIVED"
  | "APPLICATION_REJECTED"
  | "NEW_APPLICATION"
  | "CANDIDATE_WITHDREW"
  | "INTERVIEW_RESPONSE";

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId; // User._id — works for both candidate and employer users
  type: NotificationType;
  message: string;
  isRead: boolean;
  relatedEntity?: {
    kind: "APPLICATION" | "JOB" | "INTERVIEW";
    id: Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * notifications targets `User._id` directly (not CandidateProfile or
 * EmployerProfile) since both roles receive notifications and User is
 * the one collection every role shares. `relatedEntity` is a generic
 * pointer so the frontend can deep-link without a notification-specific
 * model per entity type.
 */
const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "APPLICATION_SUBMITTED",
        "APPLICATION_SHORTLISTED",
        "INTERVIEW_SCHEDULED",
        "OFFER_RECEIVED",
        "APPLICATION_REJECTED",
        "NEW_APPLICATION",
        "CANDIDATE_WITHDREW",
        "INTERVIEW_RESPONSE",
      ],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedEntity: {
      kind: { type: String, enum: ["APPLICATION", "JOB", "INTERVIEW"] },
      id: { type: Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

// Hot path: "my notifications, unread first, newest first".
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
