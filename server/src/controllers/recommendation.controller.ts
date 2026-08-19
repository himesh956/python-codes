import { Response } from "express";
import { recommendationService } from "../services/recommendation.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getMyRecommendations = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const recommendations = await recommendationService.getRecommendationsForCandidate(
    req.user!.id,
    limit
  );
  sendSuccess(res, 200, { data: { recommendations } });
});