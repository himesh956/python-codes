import { Response } from "express";
import { recurringBookingService } from "../services/recurringBooking.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createSchedule = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const schedule = await recurringBookingService.create(req.user!.id, req.body);
  sendSuccess(res, 201, { message: "Recurring booking scheduled", data: { schedule } });
});

export const cancelSchedule = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await recurringBookingService.cancel(req.user!.id, req.params.id);
  sendSuccess(res, 200, { message: "Recurring schedule cancelled" });
});

export const getMySchedules = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const schedules = await recurringBookingService.getMySchedules(req.user!.id);
  sendSuccess(res, 200, { data: { schedules } });
});