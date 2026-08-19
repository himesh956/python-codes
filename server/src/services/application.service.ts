import { FilterQuery, Types } from "mongoose";
import { Application, IApplication } from "../models/Application";
import { CandidateProfile } from "../models/CandidateProfile";
import { Job } from "../models/Job";
import { EmployerProfile } from "../models/EmployerProfile";
import { AppError } from "../utils/AppError";
import { ApplicationStatus } from "../constants/enums";
import { ListApplicantsQuery } from "../validators/application.validators";
import { notificationService } from "./notification.service";
import { NotificationType } from "../models/Notification";

interface PaginatedResult<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * Valid forward transitions in the hiring pipeline. Anything not
 * listed here (e.g. OFFERED -> SHORTLISTED, or updating a REJECTED/
 * WITHDRAWN application at all) is rejected — this is what keeps
 * statusHistory an honest, ordered record instead of arbitrary edits.
 */
const EMPLOYER_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFERED", "REJECTED"],
  OFFERED: ["REJECTED"],
  REJECTED: [],
  WITHDRAWN: [],
};

async function getCandidateProfileOrThrow(userId: string) {
  const profile = await CandidateProfile.findOne({ user: userId });
  if (!profile) throw AppError.notFound("Candidate profile not found");
  return profile;
}

async function getEmployerProfileOrThrow(userId: string) {
  const profile = await EmployerProfile.findOne({ user: userId });
  if (!profile) throw AppError.notFound("Employer profile not found");
  return profile;
}

/**
 * One-click apply. Prevents duplicate applications two ways: an
 * explicit pre-check (fast, friendly error message) and reliance on
 * the DB's compound unique index on (candidate, job) as the real
 * guarantee under concurrent requests (Part 12/45 — never trust a
 * single layer of validation).
 */
async function apply(userId: string, jobId: string): Promise<IApplication> {
  const candidate = await getCandidateProfileOrThrow(userId);

  if (!candidate.resume) {
    throw AppError.badRequest("Upload a resume before applying to jobs");
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw AppError.notFound("Job not found");
  }
  if (job.status !== "PUBLISHED") {
    throw AppError.badRequest("This job is not currently accepting applications");
  }

  const existing = await Application.findOne({ candidate: candidate._id, job: job._id });
  if (existing) {
    throw AppError.conflict("You have already applied to this job");
  }

  try {
    const application = await Application.create({
      candidate: candidate._id,
      job: job._id,
      employer: job.employer,
      company: job.company,
      resume: candidate.resume,
      status: "APPLIED",
      statusHistory: [{ status: "APPLIED", changedAt: new Date() }],
      appliedAt: new Date(),
    });

    // Notify the employer's user account of the new application.
    // Best-effort: never blocks or fails the application itself.
    const employerProfile = await EmployerProfile.findById(job.employer);
    if (employerProfile) {
      await notificationService.create({
        recipient: employerProfile.user,
        type: "NEW_APPLICATION",
        message: `New application received for "${job.title}"`,
        relatedEntity: { kind: "APPLICATION", id: application._id },
      });
    }

    return application;
  } catch (err) {
    // Race condition: two simultaneous requests both passed the check
    // above. The unique index rejects the second insert with code 11000.
    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000) {
      throw AppError.conflict("You have already applied to this job");
    }
    throw err;
  }
}

async function getMyApplications(userId: string): Promise<IApplication[]> {
  const candidate = await getCandidateProfileOrThrow(userId);
  return Application.find({ candidate: candidate._id })
    .sort({ createdAt: -1 })
    .populate("job", "title company location employmentType workMode status")
    .populate("company", "name logoUrl");
}

async function getApplicationById(userId: string, role: string, applicationId: string): Promise<IApplication> {
  const application = await Application.findById(applicationId)
    .populate("job")
    .populate("company", "name logoUrl")
    .populate("candidate");
  if (!application) {
    throw AppError.notFound("Application not found");
  }

  if (role === "CANDIDATE") {
    const candidate = await getCandidateProfileOrThrow(userId);
    if (application.candidate._id.toString() !== candidate._id.toString()) {
      throw AppError.forbidden("You do not have access to this application");
    }
  } else if (role === "EMPLOYER") {
    const employer = await getEmployerProfileOrThrow(userId);
    if (application.employer.toString() !== employer._id.toString()) {
      throw AppError.forbidden("You do not have access to this application");
    }
  }

  return application;
}

/**
 * Employer's applicant list for one of THEIR jobs. Ownership is
 * enforced by first resolving the job via the requesting employer's
 * own EmployerProfile — an employer can never list applicants for a
 * job that isn't theirs, even if they guess a valid jobId.
 */
async function listApplicantsForJob(
  userId: string,
  jobId: string,
  query: ListApplicantsQuery
): Promise<PaginatedResult<IApplication>> {
  const employer = await getEmployerProfileOrThrow(userId);
  const job = await Job.findById(jobId);
  if (!job) throw AppError.notFound("Job not found");
  if (job.employer.toString() !== employer._id.toString()) {
    throw AppError.forbidden("You do not have permission to view these applicants");
  }

  const filter: FilterQuery<IApplication> = { job: job._id };
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("candidate", "fullName skills expectedCTC photoUrl")
      .populate("resume", "cloudinaryUrl fileName"),
    Application.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

const STATUS_NOTIFICATION_TYPE: Partial<Record<ApplicationStatus, NotificationType>> = {
  SHORTLISTED: "APPLICATION_SHORTLISTED",
  OFFERED: "OFFER_RECEIVED",
  REJECTED: "APPLICATION_REJECTED",
};

async function updateStatusByEmployer(
  userId: string,
  applicationId: string,
  newStatus: ApplicationStatus,
  note: string | undefined
): Promise<IApplication> {
  const employer = await getEmployerProfileOrThrow(userId);
  const application = await Application.findById(applicationId);
  if (!application) throw AppError.notFound("Application not found");
  if (application.employer.toString() !== employer._id.toString()) {
    throw AppError.forbidden("You do not have permission to update this application");
  }

  const allowed = EMPLOYER_TRANSITIONS[application.status];
  if (!allowed.includes(newStatus)) {
    throw AppError.badRequest(
      `Cannot move application from ${application.status} to ${newStatus}`
    );
  }

  application.status = newStatus;
  application.statusHistory.push({ status: newStatus, changedAt: new Date(), note });
  await application.save();

  const notificationType = STATUS_NOTIFICATION_TYPE[newStatus];
  if (notificationType) {
    const candidate = await CandidateProfile.findById(application.candidate);
    if (candidate) {
      await notificationService.create({
        recipient: candidate.user,
        type: notificationType,
        message: `Your application status changed to ${newStatus}`,
        relatedEntity: { kind: "APPLICATION", id: application._id },
      });
    }
  }

  return application;
}

async function withdraw(userId: string, applicationId: string): Promise<IApplication> {
  const candidate = await getCandidateProfileOrThrow(userId);
  const application = await Application.findById(applicationId);
  if (!application) throw AppError.notFound("Application not found");
  if (application.candidate.toString() !== candidate._id.toString()) {
    throw AppError.forbidden("You do not have permission to withdraw this application");
  }
  if (application.status === "REJECTED" || application.status === "WITHDRAWN") {
    throw AppError.badRequest(`Cannot withdraw an application that is already ${application.status}`);
  }

  application.status = "WITHDRAWN";
  application.statusHistory.push({ status: "WITHDRAWN", changedAt: new Date() });
  await application.save();

  const employerProfile = await EmployerProfile.findById(application.employer);
  if (employerProfile) {
    await notificationService.create({
      recipient: employerProfile.user,
      type: "CANDIDATE_WITHDREW",
      message: "A candidate withdrew their application",
      relatedEntity: { kind: "APPLICATION", id: application._id },
    });
  }

  return application;
}

export const applicationService = {
  apply,
  getMyApplications,
  getApplicationById,
  listApplicantsForJob,
  updateStatusByEmployer,
  withdraw,
};
