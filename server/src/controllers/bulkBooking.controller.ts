import { Response } from "express";
import { bulkBookingService } from "../services/bulkBooking.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createBulkRequest = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const bulkRequest = await bulkBookingService.create(req.user!.id, req.body);
  sendSuccess(res, 201, {
    message: `Bulk request sent to available workers`,
    data: { bulkRequest },
  });
});

export const getMyBulkRequests = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const bulkRequests = await bulkBookingService.getMyBulkRequests(req.user!.id);
  sendSuccess(res, 200, { data: { bulkRequests } });
});