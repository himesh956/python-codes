import { Response } from "express";
import { applicationService } from "../services/application.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const apply = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const application = await applicationService.apply(req.user!.id, req.body.jobId);
  sendSuccess(res, 201, { message: "Application submitted successfully", data: { application } });
});

export const getMyApplications = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const applications = await applicationService.getMyApplications(req.user!.id);
  sendSuccess(res, 200, { data: { applications } });
});

export const getApplicationById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const application = await applicationService.getApplicationById(
    req.user!.id,
    req.user!.role,
    req.params.id
  );
  sendSuccess(res, 200, { data: { application } });
});

export const withdraw = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const application = await applicationService.withdraw(req.user!.id, req.params.id);
  sendSuccess(res, 200, { message: "Application withdrawn", data: { application } });
});

export const listApplicantsForJob = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await applicationService.listApplicantsForJob(
    req.user!.id,
    req.params.jobId,
    req.query as never
  );
  sendSuccess(res, 200, { data: result.items, meta: result.meta });
});

export const updateApplicationStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const application = await applicationService.updateStatusByEmployer(
    req.user!.id,
    req.params.id,
    req.body.status,
    req.body.note
  );
  sendSuccess(res, 200, {
    message: `Application moved to ${application.status}`,
    data: { application },
  });
});
