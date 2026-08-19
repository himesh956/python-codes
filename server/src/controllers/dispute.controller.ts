import { Response } from "express";
import { disputeService } from "../services/dispute.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createDispute = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const dispute = await disputeService.create(
    req.user!.id,
    req.body.bookingId,
    req.body.category,
    req.body.reason,
    req.body.evidenceUrls
  );
  sendSuccess(res, 201, { message: "Dispute filed — an admin will review it", data: { dispute } });
});

export const listDisputesForAdmin = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const disputes = await disputeService.listForAdmin(req.query.status as string | undefined);
  sendSuccess(res, 200, { data: { disputes } });
});

export const resolveDispute = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const dispute = await disputeService.resolve(req.user!.id, req.params.id, req.body.adminResolution);
  sendSuccess(res, 200, { message: "Dispute resolved", data: { dispute } });
});