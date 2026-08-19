import { Response } from "express";
import { trustSafetyService } from "../services/trustSafety.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createReport = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const report = await trustSafetyService.createReport(
    req.user!.id,
    req.body.targetType,
    req.body.targetId,
    req.body.reason,
    req.body.details
  );
  sendSuccess(res, 201, { message: "Report submitted — an admin will review it", data: { report } });
});

export const listReportsForAdmin = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const reports = await trustSafetyService.listReportsForAdmin(req.query.status as string | undefined);
  sendSuccess(res, 200, { data: { reports } });
});

export const resolveReport = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const report = await trustSafetyService.resolveReport(req.user!.id, req.params.id, req.body.status);
  sendSuccess(res, 200, { message: "Report updated", data: { report } });
});

export const blockUser = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await trustSafetyService.blockUser(req.user!.id, req.body.userId);
  sendSuccess(res, 200, { message: "User blocked" });
});

export const unblockUser = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await trustSafetyService.unblockUser(req.user!.id, req.params.userId);
  sendSuccess(res, 200, { message: "User unblocked" });
});

export const getMyBlockedUsers = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const blockedUserIds = await trustSafetyService.getMyBlockedUsers(req.user!.id);
  sendSuccess(res, 200, { data: { blockedUserIds } });
});