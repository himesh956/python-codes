import { Schema, model, Document, Types } from "mongoose";

export interface IBlock extends Document {
  _id: Types.ObjectId;
  blocker: Types.ObjectId;
  blocked: Types.ObjectId;
  createdAt: Date;
}

/**
 * One-directional block (A blocks B — B is not automatically blocked
 * from A). Used to prevent a blocked user from starting new chats/
 * bookings/calls with the blocker — enforced at the relevant service
 * layer (chat.service.ts, booking.service.ts), not here.
 */
const blockSchema = new Schema<IBlock>(
  {
    blocker: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blocked: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export const Block = model<IBlock>("Block", blockSchema);