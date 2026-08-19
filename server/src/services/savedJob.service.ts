import { SavedJob, ISavedJob } from "../models/SavedJob";
import { CandidateProfile } from "../models/CandidateProfile";
import { Job } from "../models/Job";
import { AppError } from "../utils/AppError";

async function getCandidateProfileOrThrow(userId: string) {
  const profile = await CandidateProfile.findOne({ user: userId });
  if (!profile) throw AppError.notFound("Candidate profile not found");
  return profile;
}

/**
 * Same duplicate-prevention pattern as applications: a friendly
 * pre-check plus the model's compound unique index on (candidate, job)
 * as the actual race-condition-proof guarantee.
 */
async function save(userId: string, jobId: string): Promise<ISavedJob> {
  const candidate = await getCandidateProfileOrThrow(userId);

  const job = await Job.findById(jobId);
  if (!job) {
    throw AppError.notFound("Job not found");
  }

  const existing = await SavedJob.findOne({ candidate: candidate._id, job: job._id });
  if (existing) {
    throw AppError.conflict("Job is already saved");
  }

  try {
    return await SavedJob.create({ candidate: candidate._id, job: job._id });
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000) {
      throw AppError.conflict("Job is already saved");
    }
    throw err;
  }
}

async function unsave(userId: string, jobId: string): Promise<void> {
  const candidate = await getCandidateProfileOrThrow(userId);
  const result = await SavedJob.findOneAndDelete({ candidate: candidate._id, job: jobId });
  if (!result) {
    throw AppError.notFound("Saved job not found");
  }
}

async function listMine(userId: string): Promise<ISavedJob[]> {
  const candidate = await getCandidateProfileOrThrow(userId);
  return SavedJob.find({ candidate: candidate._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "job",
      populate: { path: "company", select: "name logoUrl" },
    });
}

export const savedJobService = { save, unsave, listMine };
