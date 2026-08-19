import { Response, Request } from "express";
import { fraudDetectionService } from "../services/fraudDetection.service";
import { User } from "../models/User";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const checkWorkerFlags = catchAsync(async (req: Request, res: Response) => {
  const flags = await fraudDetectionService.runChecksForWorker(req.params.workerId);
  sendSuccess(res, 200, { data: { flags } });
});

export const checkUserFlags = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw AppError.notFound("User not found");

  const flags = await fraudDetectionService.runChecksForCustomer(req.params.userId, user.email);
  sendSuccess(res, 200, { data: { flags } });
});