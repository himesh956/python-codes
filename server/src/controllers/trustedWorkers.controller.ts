import { Response } from "express";
import { trustedWorkersService } from "../services/trustedWorkers.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getMyTrustedWorkers = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const trustedWorkers = await trustedWorkersService.getTrustedWorkersForCustomer(req.user!.id);
  sendSuccess(res, 200, { data: { trustedWorkers } });
});