import { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";

export const getDashboard = catchAsync(async (_req: Request, res: Response) => {
  const [summary, applicationsOverTime, funnel, jobTypeDistribution, workModeDistribution] =
    await Promise.all([
      analyticsService.getSummaryCards(),
      analyticsService.getApplicationsOverTime(30),
      analyticsService.getApplicationFunnel(),
      analyticsService.getJobTypeDistribution(),
      analyticsService.getWorkModeDistribution(),
    ]);

  sendSuccess(res, 200, {
    data: { summary, applicationsOverTime, funnel, jobTypeDistribution, workModeDistribution },
  });
});

export const getApplicationsOverTime = catchAsync(async (req: Request, res: Response) => {
  const range = Number(req.query.range ?? 30) as 7 | 30 | 90;
  const data = await analyticsService.getApplicationsOverTime(range);
  sendSuccess(res, 200, { data });
});

export const getTopSkills = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const data = await analyticsService.getTopSkills(limit);
  sendSuccess(res, 200, { data });
});

export const getAverageCTCByRole = catchAsync(async (_req: Request, res: Response) => {
  const data = await analyticsService.getAverageCTCByRole();
  sendSuccess(res, 200, { data });
});

export const getAverageCTCByLocation = catchAsync(async (_req: Request, res: Response) => {
  const data = await analyticsService.getAverageCTCByLocation();
  sendSuccess(res, 200, { data });
});

export const getApplicationFunnel = catchAsync(async (_req: Request, res: Response) => {
  const data = await analyticsService.getApplicationFunnel();
  sendSuccess(res, 200, { data });
});

export const getJobTypeDistribution = catchAsync(async (_req: Request, res: Response) => {
  const data = await analyticsService.getJobTypeDistribution();
  sendSuccess(res, 200, { data });
});

export const getWorkModeDistribution = catchAsync(async (_req: Request, res: Response) => {
  const data = await analyticsService.getWorkModeDistribution();
  sendSuccess(res, 200, { data });
});

export const getHiringTrends = catchAsync(async (_req: Request, res: Response) => {
  const data = await analyticsService.getHiringTrends();
  sendSuccess(res, 200, { data });
});

export const getLocationWiseJobs = catchAsync(async (_req: Request, res: Response) => {
  const data = await analyticsService.getLocationWiseJobs();
  sendSuccess(res, 200, { data });
});

export const getCandidateSkillDistribution = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 15;
  const data = await analyticsService.getCandidateSkillDistribution(limit);
  sendSuccess(res, 200, { data });
});