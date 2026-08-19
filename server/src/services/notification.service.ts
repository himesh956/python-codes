import { Notification, INotification, NotificationType } from "../models/Notification";
import { AppError } from "../utils/AppError";
import { Types } from "mongoose";

interface CreateNotificationInput {
  recipient: Types.ObjectId | string;
  type: NotificationType;
  message: string;
  relatedEntity?: { kind: "APPLICATION" | "JOB" | "INTERVIEW"; id: Types.ObjectId | string };
}

/**
 * Fire-and-forget creation used by other services (application,
 * interview) when something notification-worthy happens. Intentionally
 * does not throw on failure to the caller's main flow — a notification
 * failing to write should never fail the underlying action (e.g. an
 * application being submitted). Errors are logged instead.
 */
async function create(input: CreateNotificationInput): Promise<void> {
  try {
    await Notification.create({
      recipient: input.recipient,
      type: input.type,
      message: input.message,
      relatedEntity: input.relatedEntity,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[notification] Failed to create notification:", err);
  }
}

async function listForUser(userId: string, unreadOnly = false): Promise<INotification[]> {
  const filter: Record<string, unknown> = { recipient: userId };
  if (unreadOnly) filter.isRead = false;

  return Notification.find(filter).sort({ isRead: 1, createdAt: -1 }).limit(100);
}

async function markRead(userId: string, notificationId: string): Promise<INotification> {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { isRead: true } },
    { new: true }
  );
  if (!notification) {
    throw AppError.notFound("Notification not found");
  }
  return notification;
}

async function markAllRead(userId: string): Promise<void> {
  await Notification.updateMany({ recipient: userId, isRead: false }, { $set: { isRead: true } });
}

async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ recipient: userId, isRead: false });
}

export const notificationService = {
  create,
  listForUser,
  markRead,
  markAllRead,
  getUnreadCount,
};
