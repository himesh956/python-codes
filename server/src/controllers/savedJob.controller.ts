import { Response } from "express";
import { savedJobService } from "../services/savedJob.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const saveJob = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const saved = await savedJobService.save(req.user!.id, req.body.jobId);
  sendSuccess(res, 201, { message: "Job saved", data: { saved } });
});

export const unsaveJob = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await savedJobService.unsave(req.user!.id, req.params.jobId);
  sendSuccess(res, 200, { message: "Job removed from saved list" });
});

export const listMySavedJobs = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const saved = await savedJobService.listMine(req.user!.id);
  sendSuccess(res, 200, { data: { saved } });
});
