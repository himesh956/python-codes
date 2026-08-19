import { FilterQuery } from "mongoose";
import { Job, IJob } from "../models/Job";
import { EmployerProfile } from "../models/EmployerProfile";
import { AppError } from "../utils/AppError";
import { CreateJobInput, UpdateJobInput, JobSearchQuery } from "../validators/job.validators";

interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function getEmployerProfileOrThrow(userId: string) {
  const profile = await EmployerProfile.findOne({ user: userId });
  if (!profile) {
    throw AppError.notFound("Employer profile not found");
  }
  return profile;
}

async function create(userId: string, input: CreateJobInput): Promise<IJob> {
  const employerProfile = await getEmployerProfileOrThrow(userId);

  return Job.create({
    ...input,
    employer: employerProfile._id,
    company: employerProfile.company,
    status: "DRAFT",
  });
}

/**
 * Ownership check: fetches the job AND verifies it belongs to the
 * requesting employer's EmployerProfile before allowing update/close.
 * This is the enforcement point for "Employer A must not modify
 * Employer B's jobs" (Part 21) — every mutating job endpoint routes
 * through this function rather than a bare `Job.findByIdAndUpdate`.
 */
async function getOwnedJobOrThrow(userId: string, jobId: string): Promise<IJob> {
  const employerProfile = await getEmployerProfileOrThrow(userId);
  const job = await Job.findById(jobId);
  if (!job) {
    throw AppError.notFound("Job not found");
  }
  if (job.employer.toString() !== employerProfile._id.toString()) {
    throw AppError.forbidden("You do not have permission to modify this job");
  }
  return job;
}

async function update(userId: string, jobId: string, input: UpdateJobInput): Promise<IJob> {
  const job = await getOwnedJobOrThrow(userId, jobId);
  Object.assign(job, input);
  await job.save();
  return job;
}

async function updateStatus(userId: string, jobId: string, status: IJob["status"]): Promise<IJob> {
  const job = await getOwnedJobOrThrow(userId, jobId);
  job.status = status;
  await job.save();
  return job;
}

async function getById(jobId: string, incrementView = false): Promise<IJob> {
  const job = await Job.findById(jobId).populate("company").populate({
    path: "employer",
    select: "fullName designation",
  });
  if (!job) {
    throw AppError.notFound("Job not found");
  }
  if (incrementView) {
    job.viewCount += 1;
    await job.save();
  }
  return job;
}

/**
 * Public job search/discovery. Only ever returns PUBLISHED jobs to
 * candidates (DRAFT/PAUSED/CLOSED/EXPIRED are employer/admin-only
 * views). Builds a MongoDB filter incrementally so unused filters
 * add zero query overhead, and always paginates — never returns an
 * unbounded result set (Part 11 / Part 20).
 */
async function search(query: JobSearchQuery): Promise<PaginatedResult<IJob>> {
  const filter: FilterQuery<IJob> = { status: "PUBLISHED" };

  if (query.q) {
    filter.$text = { $search: query.q };
  }
  if (query.city) {
    filter["location.city"] = new RegExp(`^${escapeRegex(query.city)}$`, "i");
  }
  if (query.skills) {
    const skillList = query.skills.split(",").map((s) => s.trim()).filter(Boolean);
    if (skillList.length > 0) {
      filter.skills = { $in: skillList };
    }
  }
  if (query.employmentType) {
    filter.employmentType = query.employmentType;
  }
  if (query.workMode) {
    filter.workMode = query.workMode;
  }
  if (query.experienceMax !== undefined) {
    filter.experienceMinYears = { $lte: query.experienceMax };
  }
  if (query.salaryMin !== undefined || query.salaryMax !== undefined) {
    filter.salaryMax = filter.salaryMax ?? {};
    if (query.salaryMin !== undefined) {
      (filter.salaryMax as Record<string, number>).$gte = query.salaryMin;
    }
  }

  const sort = resolveSort(query.sort);
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Job.find(filter).sort(sort).skip(skip).limit(limit).populate("company", "name logoUrl"),
    Job.countDocuments(filter),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

async function listForEmployer(userId: string): Promise<IJob[]> {
  const employerProfile = await getEmployerProfileOrThrow(userId);
  return Job.find({ employer: employerProfile._id }).sort({ createdAt: -1 });
}

function resolveSort(sort?: JobSearchQuery["sort"]): Record<string, 1 | -1> {
  switch (sort) {
    case "salary_desc":
      return { salaryMax: -1 };
    case "salary_asc":
      return { salaryMin: 1 };
    case "latest":
    default:
      return { createdAt: -1 };
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const jobService = {
  create,
  update,
  updateStatus,
  getById,
  search,
  listForEmployer,
  getOwnedJobOrThrow,
};
