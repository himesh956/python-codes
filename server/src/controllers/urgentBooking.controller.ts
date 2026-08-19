import { Response } from "express";
import { urgentBookingService } from "../services/urgentBooking.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

/**
 * Manual "suggest next" endpoint — used by the frontend immediately
 * after a customer's request is declined (not just relying on the
 * background sweeper, which only handles timeouts) so the UI can
 * offer "Try this worker instead" right away on an active decline.
 */
export const suggestNext = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const suggestion = await urgentBookingService.suggestNextWorker(req.params.bookingId);
  sendSuccess(res, 200, { data: { suggestion } });
});