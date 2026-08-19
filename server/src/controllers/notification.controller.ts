import { Response } from "express";
import { notificationService } from "../services/notification.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const listMyNotifications = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const unreadOnly = req.query.unreadOnly === "true";
  const notifications = await notificationService.listForUser(req.user!.id, unreadOnly);
  const unreadCount = await notificationService.getUnreadCount(req.user!.id);
  sendSuccess(res, 200, { data: { notifications, unreadCount } });
});

export const markRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const notification = await notificationService.markRead(req.user!.id, req.params.id);
  sendSuccess(res, 200, { message: "Marked as read", data: { notification } });
});

export const markAllRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await notificationService.markAllRead(req.user!.id);
  sendSuccess(res, 200, { message: "All notifications marked as read" });
});
