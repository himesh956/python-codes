import { Response } from "express";
import { callingService } from "../services/calling/calling.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const initiateCall = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const call = await callingService.initiate(
    req.user!.id,
    req.body.receiverId,
    req.body.contextType,
    req.body.contextId
  );
  sendSuccess(res, 201, { data: { call } });
});

export const getMyCallHistory = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const calls = await callingService.getMyCallHistory(req.user!.id);
  sendSuccess(res, 200, { data: { calls } });
});