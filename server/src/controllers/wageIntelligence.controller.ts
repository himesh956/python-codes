import { Request, Response } from "express";
import { wageIntelligenceService } from "../services/wageIntelligence.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";

export const getWageEstimate = catchAsync(async (req: Request, res: Response) => {
  const { categoryId, city, experienceYears } = req.query as unknown as {
    categoryId: string;
    city: string;
    experienceYears: number;
  };

  const estimate = await wageIntelligenceService.getWageEstimate(categoryId, city, experienceYears);

  if (!estimate) {
    sendSuccess(res, 200, {
      message: "Not enough platform data yet for this category/location",
      data: { estimate: null },
    });
    return;
  }

  sendSuccess(res, 200, { data: { estimate } });
});