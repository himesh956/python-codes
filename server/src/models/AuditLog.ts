import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  actor: Types.ObjectId; // User._id of the admin who performed the action
  action: string; // e.g. "JOB_APPROVED", "EMPLOYER_SUSPENDED"
  targetType: "USER" | "JOB" | "COMPANY" | "APPLICATION";
  targetId: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * auditLogs is append-only and exists purely for accountability on
 * admin/moderation actions (Part 33). Never updated or deleted by
 * the application; only ever inserted.
 */
const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String, enum: ["USER", "JOB", "COMPANY", "APPLICATION"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
