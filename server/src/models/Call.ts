import { Schema, model, Document, Types } from "mongoose";

export type CallStatus = "INITIATED" | "RINGING" | "CONNECTED" | "COMPLETED" | "FAILED" | "MISSED";
export type CallContextType = "BOOKING" | "APPLICATION";

export interface ICall extends Document {
  _id: Types.ObjectId;
  caller: Types.ObjectId;
  receiver: Types.ObjectId;
  contextType: CallContextType;
  contextId: Types.ObjectId;
  providerCallId?: string; // opaque ID from whatever telephony provider is wired up later
  status: CallStatus;
  durationSeconds?: number;
  createdAt: Date;
  endedAt?: Date;
}

/**
 * Deliberately does NOT store either party's phone number — that's
 * the entire point of "privacy-first calling" (Phase 3 of the
 * revised brief). The real phone-masking/connection logic lives
 * behind CallingProvider (see callingProvider.interface.ts); this
 * model only tracks the metadata needed for history, abuse
 * prevention, and rate limiting.
 */
const callSchema = new Schema<ICall>({
  caller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  contextType: { type: String, enum: ["BOOKING", "APPLICATION"], required: true },
  contextId: { type: Schema.Types.ObjectId, required: true },
  providerCallId: String,
  status: {
    type: String,
    enum: ["INITIATED", "RINGING", "CONNECTED", "COMPLETED", "FAILED", "MISSED"],
    default: "INITIATED",
  },
  durationSeconds: Number,
  createdAt: { type: Date, default: Date.now },
  endedAt: Date,
});

callSchema.index({ caller: 1, createdAt: -1 });
callSchema.index({ contextType: 1, contextId: 1 });

export const Call = model<ICall>("Call", callSchema);