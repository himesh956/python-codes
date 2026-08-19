import { Response, Request } from "express";
import { reviewService } from "../services/review.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const submitReview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const review = await reviewService.submit(req.user!.id, req.body);
  sendSuccess(res, 201, { message: "Review submitted", data: { review } });
});

export const listReviewsForWorker = catchAsync(async (req: Request, res: Response) => {
  const reviews = await reviewService.listForWorker(req.params.workerId);
  sendSuccess(res, 200, { data: { reviews } });
});

export const reportReview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await reviewService.report(req.user!.id, req.params.id, req.body.reason);
  sendSuccess(res, 200, { message: "Review reported — an admin will review it" });
});