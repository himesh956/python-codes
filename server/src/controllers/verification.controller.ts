import { Response, Request } from "express";
import { verificationService } from "../services/verification.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const submitVerification = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const verification = await verificationService.submit(
    req.user!.id,
    req.body.type,
    req.body.evidenceRef
  );
  sendSuccess(res, 200, { message: "Verification submitted", data: { verification } });
});

export const listForWorker = catchAsync(async (req: Request, res: Response) => {
  const verifications = await verificationService.listForWorker(req.params.workerId);
  sendSuccess(res, 200, { data: { verifications } });
});

export const listPendingForAdmin = catchAsync(async (_req: AuthenticatedRequest, res: Response) => {
  const verifications = await verificationService.listPendingForAdmin();
  sendSuccess(res, 200, { data: { verifications } });
});

export const reviewVerification = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const verification = await verificationService.review(
    req.user!.id,
    req.params.id,
    req.body.approve
  );
  sendSuccess(res, 200, {
    message: `Verification ${verification.status.toLowerCase()}`,
    data: { verification },
  });
});