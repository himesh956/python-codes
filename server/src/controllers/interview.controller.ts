import { Response } from "express";
import { interviewService } from "../services/interview.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const scheduleInterview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const interview = await interviewService.schedule(req.user!.id, req.body);
  sendSuccess(res, 201, { message: "Interview scheduled", data: { interview } });
});

export const updateInterview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const interview = await interviewService.updateByEmployer(req.user!.id, req.params.id, req.body);
  sendSuccess(res, 200, { message: "Interview updated", data: { interview } });
});

export const listMyUpcomingInterviews = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const interviews = await interviewService.listUpcomingForCandidate(req.user!.id);
  sendSuccess(res, 200, { data: { interviews } });
});

export const listInterviewsForApplication = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const interviews = await interviewService.listForEmployerJob(req.user!.id, req.params.applicationId);
  sendSuccess(res, 200, { data: { interviews } });
});