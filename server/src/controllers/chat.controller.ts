import { Response } from "express";
import { chatService } from "../services/chat.service";
import { voiceMessageService } from "../services/voiceMessage.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const startConversation = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const conversation = await chatService.startOrGetConversation(
    req.user!.id,
    req.body.otherUserId,
    req.body.contextType,
    req.body.contextId
  );
  sendSuccess(res, 200, { data: { conversation } });
});

export const getMyConversations = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const conversations = await chatService.getMyConversations(req.user!.id);
  const unreadTotal = await chatService.getTotalUnreadCount(req.user!.id);
  sendSuccess(res, 200, { data: { conversations, unreadTotal } });
});

export const getMessages = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const messages = await chatService.getMessages(req.user!.id, req.params.id);
  sendSuccess(res, 200, { data: { messages } });
});

export const sendMessage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const message = await chatService.sendMessage(
    req.user!.id,
    req.params.id,
    req.body.text,
    req.body.originalLanguage
  );
  sendSuccess(res, 201, { data: { message } });
});

export const sendVoiceMessage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw AppError.badRequest("No voice recording provided");
  }
  const durationSeconds = Number(req.body.durationSeconds ?? 0);

  const { url } = await voiceMessageService.upload(req.file);
  const message = await chatService.sendVoiceMessage(req.user!.id, req.params.id, url, durationSeconds);
  sendSuccess(res, 201, { data: { message } });
});

export const translateMessage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const message = await chatService.translateMessage(
    req.user!.id,
    req.params.messageId,
    req.body.targetLanguage
  );
  sendSuccess(res, 200, { data: { message } });
});

export const markRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await chatService.markConversationRead(req.user!.id, req.params.id);
  sendSuccess(res, 200, { message: "Marked as read" });
});