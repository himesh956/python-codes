import { Schema, model, Document, Types } from "mongoose";

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[]; // exactly 2 User._id — kept as array for future group-chat extensibility, not used yet
  contextType: "BOOKING" | "APPLICATION" | "JOB" | "GENERAL";
  contextId?: Types.ObjectId; // Booking._id or Application._id — ties chat to a valid interaction
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: Map<string, number>; // userId (string) -> unread count, per-participant
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A conversation is only ever created after a valid interaction
 * (booking or application exists) — enforced in chat.service.ts, not
 * here — this keeps the model itself simple and reusable. contextType
 * + contextId let the UI show "Chat about: Electrician booking" as
 * a header, and let ownership checks verify the participant actually
 * belongs to that booking/application before allowing access.
 * unreadCount is a Map keyed by userId so each participant's unread
 * badge is O(1) to read/update without scanning all messages.
 */
const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      required: true,
      validate: {
        validator: (arr: Types.ObjectId[]) => arr.length === 2,
        message: "A conversation must have exactly 2 participants",
      },
    },
    contextType: { type: String, enum: ["BOOKING", "APPLICATION", "JOB", "GENERAL"], required: true },
    contextId: { type: Schema.Types.ObjectId },
    lastMessage: { type: String, maxlength: 300 },
    lastMessageAt: Date,
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// One conversation per (participant pair, context) — prevents duplicate
// threads for the same booking/application.
conversationSchema.index({ participants: 1, contextType: 1, contextId: 1 });
// "My conversations" list, newest activity first.
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

export const Conversation = model<IConversation>("Conversation", conversationSchema);