import { Request, Response } from "express";
import { workerAnalyticsService } from "../services/workerAnalytics.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";

export const getDashboard = catchAsync(async (_req: Request, res: Response) => {
  const [northStar, completionRate, disputeRate, retention] = await Promise.all([
    workerAnalyticsService.getNorthStarMetric(),
    workerAnalyticsService.getBookingCompletionRate(),
    workerAnalyticsService.getDisputeRate(),
    workerAnalyticsService.getWorkerRetention(),
  ]);
  sendSuccess(res, 200, { data: { northStar, completionRate, disputeRate, retention } });
});

export const getCategoryDemand = catchAsync(async (_req: Request, res: Response) => {
  const data = await workerAnalyticsService.getCategoryDemand();
  sendSuccess(res, 200, { data });
});

export const getAverageWageByCategory = catchAsync(async (_req: Request, res: Response) => {
  const data = await workerAnalyticsService.getAverageWageByCategory();
  sendSuccess(res, 200, { data });
});

export const getTopRatedWorkers = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const data = await workerAnalyticsService.getTopRatedWorkers(limit);
  sendSuccess(res, 200, { data });
});

export const getCategoryGrowthTrend = catchAsync(async (_req: Request, res: Response) => {
  const data = await workerAnalyticsService.getCategoryGrowthTrend();
  sendSuccess(res, 200, { data });
});