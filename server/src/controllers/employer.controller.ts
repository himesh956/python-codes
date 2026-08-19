import { Response } from "express";
import { employerService } from "../services/employer.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getMyProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await employerService.getByUserId(req.user!.id);
  sendSuccess(res, 200, { data: { profile } });
});

export const updateMyProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await employerService.updateByUserId(req.user!.id, req.body);
  sendSuccess(res, 200, { message: "Profile updated successfully", data: { profile } });
});

export const updateMyCompany = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const company = await employerService.updateMyCompany(req.user!.id, req.body);
  sendSuccess(res, 200, { message: "Company updated successfully", data: { company } });
});
