import { Response, Request } from "express";
import { workerService } from "../services/worker.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const upsertMyProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await workerService.upsertMyProfile(req.user!.id, req.body);
  sendSuccess(res, 200, { message: "Worker profile saved", data: { profile } });
});

export const getMyProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await workerService.getMyProfile(req.user!.id);
  sendSuccess(res, 200, { data: { profile } });
});

export const getWorkerById = catchAsync(async (req: Request, res: Response) => {
  const profile = await workerService.getById(req.params.id);
  sendSuccess(res, 200, { data: { profile } });
});

export const updateAvailability = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await workerService.updateAvailability(req.user!.id, req.body.availabilityState);
  sendSuccess(res, 200, { message: "Availability updated", data: { profile } });
});

export const searchWorkers = catchAsync(async (req: Request, res: Response) => {
  const result = await workerService.search(req.query as never);
  sendSuccess(res, 200, { data: result.items, meta: result.meta });
});