import { Response } from "express";
import { candidateService } from "../services/candidate.service";
import { resumeService } from "../services/resume.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getMyProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await candidateService.getByUserId(req.user!.id);
  sendSuccess(res, 200, {
    data: {
      profile,
      profileCompletion: candidateService.computeProfileCompletion(profile),
    },
  });
});

export const updateMyProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await candidateService.updateByUserId(req.user!.id, req.body);
  sendSuccess(res, 200, {
    message: "Profile updated successfully",
    data: { profile, profileCompletion: candidateService.computeProfileCompletion(profile) },
  });
});

export const uploadResume = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw AppError.badRequest("No resume file provided");
  }
  const profile = await candidateService.getByUserId(req.user!.id);
  const resume = await resumeService.uploadForCandidate(profile._id.toString(), req.file);
  sendSuccess(res, 200, { message: "Resume uploaded successfully", data: { resume } });
});

export const deleteResume = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await candidateService.getByUserId(req.user!.id);
  await resumeService.deleteForCandidate(profile._id.toString());
  sendSuccess(res, 200, { message: "Resume deleted successfully" });
});
