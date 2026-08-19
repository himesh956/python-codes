import { Verification, IVerification } from "../models/Verification";
import { WorkerProfile } from "../models/WorkerProfile";
import { AppError } from "../utils/AppError";
import { trustScoreService } from "./trustScore.service";
import { VerificationType } from "../constants/workerEnums";

/**
 * PHONE verification auto-approves at MVP (the phone number is already
 * the account's unique identity per the existing User model — no
 * separate OTP flow needed here since registration is already
 * phone/email-gated). GOVT_ID requires manual admin review — has real
 * liability/fraud implications. SKILL_TEST auto-approves for MVP too
 * (a lightweight self-declared quiz, per Part 5/9's "not full
 * certification" scoping) — genuine skill-test infrastructure is a V1+ build.
 */
async function submit(
  userId: string,
  type: VerificationType,
  evidenceRef?: string
): Promise<IVerification> {
  const worker = await WorkerProfile.findOne({ user: userId });
  if (!worker) throw AppError.notFound("Worker profile not found");

  const existing = await Verification.findOne({ worker: worker._id, type });
  if (existing && existing.status === "VERIFIED") {
    throw AppError.conflict(`${type} is already verified`);
  }

  const autoApprove = type === "PHONE" || type === "SKILL_TEST";

  const verification = await Verification.findOneAndUpdate(
    { worker: worker._id, type },
    {
      $set: {
        status: autoApprove ? "VERIFIED" : "PENDING",
        evidenceRef,
        verifiedAt: autoApprove ? new Date() : undefined,
      },
    },
    { new: true, upsert: true }
  );

  if (autoApprove) {
    await trustScoreService.recompute(worker._id.toString());
  }

  return verification;
}

async function listForWorker(workerId: string): Promise<IVerification[]> {
  return Verification.find({ worker: workerId });
}

async function listPendingForAdmin(): Promise<IVerification[]> {
  return Verification.find({ status: "PENDING" })
    .sort({ createdAt: 1 })
    .populate("worker", "fullName phone");
}

/** Admin-only — the manual review step for GOVT_ID verification. */
async function review(
  adminUserId: string,
  verificationId: string,
  approve: boolean
): Promise<IVerification> {
  const verification = await Verification.findById(verificationId);
  if (!verification) throw AppError.notFound("Verification request not found");

  verification.status = approve ? "VERIFIED" : "REJECTED";
  verification.reviewedBy = adminUserId as unknown as typeof verification.reviewedBy;
  verification.verifiedAt = approve ? new Date() : undefined;
  await verification.save();

  if (approve) {
    await trustScoreService.recompute(verification.worker.toString());
  }

  return verification;
}

export const verificationService = { submit, listForWorker, listPendingForAdmin, review };