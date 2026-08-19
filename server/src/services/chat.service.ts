import { Conversation, IConversation } from "../models/Conversation";
import { Message, IMessage } from "../models/Message";
import { Booking } from "../models/Booking";
import { Application } from "../models/Application";
import { WorkerProfile } from "../models/WorkerProfile";
import { CandidateProfile } from "../models/CandidateProfile";
import { AppError } from "../utils/AppError";
import { notificationService } from "./notification.service";
import { translationService } from "./translation/translation.service";
import { trustSafetyService } from "./trustSafety.service";

async function verifyValidInteraction(
  userId: string,
  otherUserId: string,
  contextType: string,
  contextId?: string
): Promise<void> {
  if (contextType === "GENERAL" || contextType === "JOB") return;

  if (contextType === "BOOKING") {
    if (!contextId) throw AppError.badRequest("contextId is required for a booking conversation");
    const booking = await Booking.findById(contextId);
    if (!booking) throw AppError.notFound("Booking not found");

    const worker = await WorkerProfile.findById(booking.worker);
    const isCustomerPair =
      booking.customer.toString() === userId && worker?.user.toString() === otherUserId;
    const isWorkerPair =
      booking.customer.toString() === otherUserId && worker?.user.toString() === userId;

    if (!isCustomerPair && !isWorkerPair) {
      throw AppError.forbidden("You do not have a valid booking with this user");
    }
    return;
  }

  if (contextType === "APPLICATION") {
    if (!contextId) throw AppError.badRequest("contextId is required for an application conversation");
    const application = await Application.findById(contextId);
    if (!application) throw AppError.notFound("Application not found");

    const candidate = await CandidateProfile.findById(application.candidate);
    const { EmployerProfile } = await import("../models/EmployerProfile");
    const employer = await EmployerProfile.findById(application.employer);

    const isCandidateSide = candidate?.user.toString() === userId;
    const isEmployerSide = employer?.user.toString() === userId;
    const otherIsCandidateSide = candidate?.user.toString() === otherUserId;
    const otherIsEmployerSide = employer?.user.toString() === otherUserId;

    const validPair = (isCandidateSide && otherIsEmployerSide) || (isEmployerSide && otherIsCandidateSide);
    if (!validPair) {
      throw AppError.forbidden("You do not have a valid application with this user");
    }
  }
}

async function startOrGetConversation(
  userId: string,
  otherUserId: string,
  contextType: "BOOKING" | "APPLICATION" | "JOB" | "GENERAL",
  contextId?: string
): Promise<IConversation> {
  if (userId === otherUserId) {
    throw AppError.badRequest("You cannot start a conversation with yourself");
  }

  const isBlocked = await trustSafetyService.isBlockedEitherWay(userId, otherUserId);
  if (isBlocked) {
    throw AppError.forbidden("You cannot message this user");
  }

  await verifyValidInteraction(userId, otherUserId, contextType, contextId);

  const existing = await Conversation.findOne({
    participants: { $all: [userId, otherUserId] },
    contextType,
    ...(contextId ? { contextId } : {}),
  });
  if (existing) return existing;

  return Conversation.create({
    participants: [userId, otherUserId],
    contextType,
    contextId,
    unreadCount: {},
  });
}

async function getMyConversations(userId: string): Promise<IConversation[]> {
  return Conversation.find({ participants: userId })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "email role");
}

async function getConversationOrThrow(userId: string, conversationId: string): Promise<IConversation> {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw AppError.notFound("Conversation not found");
  if (!conversation.participants.some((p) => p.toString() === userId)) {
    throw AppError.forbidden("You do not have access to this conversation");
  }
  return conversation;
}

async function getMessages(userId: string, conversationId: string): Promise<IMessage[]> {
  const conversation = await getConversationOrThrow(userId, conversationId);
  const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });

  return messages.filter((m) => {
    const isSender = m.sender.toString() === userId;
    return isSender ? !m.isDeletedBySender : !m.isDeletedByReceiver;
  });
}

async function touchConversationOnNewMessage(
  conversation: IConversation,
  receiverId: string,
  previewText: string
): Promise<void> {
  conversation.lastMessage = previewText;
  conversation.lastMessageAt = new Date();
  const currentUnread = conversation.unreadCount.get(receiverId) ?? 0;
  conversation.unreadCount.set(receiverId, currentUnread + 1);
  await conversation.save();

  await notificationService.create({
    recipient: receiverId,
    type: "NEW_APPLICATION",
    message: "You have a new message",
    relatedEntity: { kind: "APPLICATION", id: conversation._id },
  });
}

async function sendMessage(
  userId: string,
  conversationId: string,
  text: string,
  originalLanguage?: "HI" | "EN"
): Promise<IMessage> {
  const conversation = await getConversationOrThrow(userId, conversationId);
  const receiverId = conversation.participants.find((p) => p.toString() !== userId);
  if (!receiverId) throw AppError.badRequest("Could not determine message receiver");

  const message = await Message.create({
    conversation: conversation._id,
    sender: userId,
    receiver: receiverId,
    type: "TEXT",
    text,
    originalLanguage,
  });

  await touchConversationOnNewMessage(conversation, receiverId.toString(), text.slice(0, 300));
  return message;
}

async function sendVoiceMessage(
  userId: string,
  conversationId: string,
  voiceUrl: string,
  durationSeconds: number
): Promise<IMessage> {
  const conversation = await getConversationOrThrow(userId, conversationId);
  const receiverId = conversation.participants.find((p) => p.toString() !== userId);
  if (!receiverId) throw AppError.badRequest("Could not determine message receiver");

  const message = await Message.create({
    conversation: conversation._id,
    sender: userId,
    receiver: receiverId,
    type: "VOICE",
    voiceUrl,
    voiceDurationSeconds: durationSeconds,
  });

  await touchConversationOnNewMessage(conversation, receiverId.toString(), "🎤 Voice message");
  return message;
}

async function translateMessage(
  userId: string,
  messageId: string,
  targetLanguage: "HI" | "EN"
): Promise<IMessage> {
  const message = await Message.findById(messageId);
  if (!message) throw AppError.notFound("Message not found");

  const isParticipant = message.sender.toString() === userId || message.receiver.toString() === userId;
  if (!isParticipant) {
    throw AppError.forbidden("You do not have access to this message");
  }
  if (!message.text) {
    throw AppError.badRequest("This message has no text to translate");
  }
  if (message.translatedLanguage === targetLanguage && message.translatedText) {
    return message;
  }

  const result = await translationService.translate(message.text, targetLanguage);
  message.translatedText = result.translatedText;
  message.translatedLanguage = result.translatedLanguage;
  await message.save();

  return message;
}

async function markConversationRead(userId: string, conversationId: string): Promise<void> {
  const conversation = await getConversationOrThrow(userId, conversationId);

  await Message.updateMany(
    { conversation: conversation._id, receiver: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  conversation.unreadCount.set(userId, 0);
  await conversation.save();
}

async function getTotalUnreadCount(userId: string): Promise<number> {
  const conversations = await Conversation.find({ participants: userId });
  return conversations.reduce((sum, c) => sum + (c.unreadCount.get(userId) ?? 0), 0);
}

export const chatService = {
  startOrGetConversation,
  getMyConversations,
  getConversationOrThrow,
  getMessages,
  sendMessage,
  sendVoiceMessage,
  translateMessage,
  markConversationRead,
  getTotalUnreadCount,
};