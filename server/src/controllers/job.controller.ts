import { Response, Request } from "express";
import { jobService } from "../services/job.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createJob = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const job = await jobService.create(req.user!.id, req.body);
  sendSuccess(res, 201, { message: "Job created as draft", data: { job } });
});

export const updateJob = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const job = await jobService.update(req.user!.id, req.params.id, req.body);
  sendSuccess(res, 200, { message: "Job updated successfully", data: { job } });
});

export const updateJobStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const job = await jobService.updateStatus(req.user!.id, req.params.id, req.body.status);
  sendSuccess(res, 200, { message: `Job status updated to ${job.status}`, data: { job } });
});

export const getJob = catchAsync(async (req: Request, res: Response) => {
  const job = await jobService.getById(req.params.id, true);
  sendSuccess(res, 200, { data: { job } });
});

export const searchJobs = catchAsync(async (req: Request, res: Response) => {
  const result = await jobService.search(req.query as never);
  sendSuccess(res, 200, { data: result.items, meta: result.meta });
});

export const listMyJobs = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const jobs = await jobService.listForEmployer(req.user!.id);
  sendSuccess(res, 200, { data: { jobs } });
});
