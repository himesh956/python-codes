import { Schema, model, Document, Types } from "mongoose";

export type MessageType = "TEXT" | "VOICE";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  type: MessageType;
  text?: string;
  originalLanguage?: "HI" | "EN";
  translatedText?: string;
  translatedLanguage?: "HI" | "EN";
  voiceUrl?: string;
  voiceDurationSeconds?: number;
  isRead: boolean;
  readAt?: Date;
  isDeletedBySender: boolean;
  isDeletedByReceiver: boolean;
  createdAt: Date;
}

/**
 * translatedText/translatedLanguage are populated ONLY on-demand (Phase
 * 2 — the "Translate" tap action), never automatically — this is the
 * explicit MVP scoping from the product brief ("do not automatically
 * translate every message if that causes unnecessary API cost").
 * Soft deletion is per-side (isDeletedBySender/Receiver) so one
 * participant "deleting" a message doesn't remove it for the other —
 * matches WhatsApp's actual behavior, not a shared hard delete.
 */
const messageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["TEXT", "VOICE"], default: "TEXT" },
    text: { type: String, maxlength: 2000 },
    originalLanguage: { type: String, enum: ["HI", "EN"] },
    translatedText: { type: String, maxlength: 2000 },
    translatedLanguage: { type: String, enum: ["HI", "EN"] },
    voiceUrl: String,
    voiceDurationSeconds: Number,
    isRead: { type: Boolean, default: false },
    readAt: Date,
    isDeletedBySender: { type: Boolean, default: false },
    isDeletedByReceiver: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Hot path: loading a conversation's messages, newest last (chat order).
messageSchema.index({ conversation: 1, createdAt: 1 });
// Unread count / inbox queries.
messageSchema.index({ receiver: 1, isRead: 1 });

export const Message = model<IMessage>("Message", messageSchema);