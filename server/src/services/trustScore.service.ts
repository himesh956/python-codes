import { WorkerProfile } from "../models/WorkerProfile";
import { Review } from "../models/Review";
import { Verification } from "../models/Verification";
import { Booking } from "../models/Booking";
import { TrustScoreSnapshot } from "../models/TrustScoreSnapshot";

// Weights sum to 100 minus penalty headroom — matches Part 3 of the product plan.
const WEIGHTS = {
  verification: 15,
  rating: 20,
  completedJobs: 20,
  reliability: 10,
  penaltyCeiling: 20, // max points that can be deducted
};

const NEW_WORKER_BASELINE = 20; // floor for a freshly verified worker — never scored as "0"
const PLATFORM_AVERAGE_RATING = 4.0; // prior used for Bayesian smoothing until real platform data volume exists
const BAYESIAN_PRIOR_WEIGHT = 5; // "worth" of the platform-average prior, in review-count terms

/**
 * Bayesian-adjusted rating: blends a worker's own average with the
 * platform-wide average, weighted by how many reviews they actually
 * have. Few reviews -> result pulled toward the platform mean (stops
 * "5 stars from 1 review" from ranking above a proven 4.7-from-80).
 * More reviews -> the worker's own average dominates, as it should.
 */
function bayesianRating(workerAvg: number, reviewCount: number): number {
  return (
    (BAYESIAN_PRIOR_WEIGHT * PLATFORM_AVERAGE_RATING + reviewCount * workerAvg) /
    (BAYESIAN_PRIOR_WEIGHT + reviewCount)
  );
}

/**
 * Log-scaled completed-jobs score — the 10th completed job matters far
 * more than the 100th (Part 4: "cap the ranking benefit of raw job
 * count logarithmically"). log(1) = 0, so +1 avoids a zero-job worker
 * scoring identically to a log(0) edge case.
 */
function completedJobsScore(count: number): number {
  const capped = Math.min(count, 200); // diminishing returns beyond this are negligible anyway
  return Math.min(WEIGHTS.completedJobs, Math.round((Math.log(capped + 1) / Math.log(201)) * WEIGHTS.completedJobs));
}

/**
 * Recency-weighted reliability: recent cancellations/response failures
 * hurt more than old ones — a worker isn't permanently punished for a
 * bad month two years ago (Part 4: "reputation isn't a permanent asset").
 * MVP version: last 90 days of bookings only.
 */
async function computeReliabilityScore(workerId: string): Promise<{ score: number; penalty: number }> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [recentTotal, recentCancelled, recentDeclined] = await Promise.all([
    Booking.countDocuments({ worker: workerId, createdAt: { $gte: ninetyDaysAgo } }),
    Booking.countDocuments({ worker: workerId, status: "CANCELLED", createdAt: { $gte: ninetyDaysAgo } }),
    Booking.countDocuments({ worker: workerId, status: "DECLINED", createdAt: { $gte: ninetyDaysAgo } }),
  ]);

  if (recentTotal === 0) {
    // No recent activity to judge — neutral score, no penalty (don't
    // punish a worker for a quiet period, only for bad behavior).
    return { score: WEIGHTS.reliability / 2, penalty: 0 };
  }

  const cancellationRate = recentCancelled / recentTotal;
  const declineRate = recentDeclined / recentTotal;

  const score = Math.round(WEIGHTS.reliability * (1 - cancellationRate));
  const penalty = Math.round(WEIGHTS.penaltyCeiling * Math.min(1, cancellationRate + declineRate * 0.5));

  return { score: Math.max(0, score), penalty };
}

async function computeVerificationScore(workerId: string): Promise<number> {
  const verifications = await Verification.find({ worker: workerId, status: "VERIFIED" });
  const types = new Set(verifications.map((v) => v.type));

  let score = 0;
  if (types.has("PHONE")) score += WEIGHTS.verification * 0.4;
  if (types.has("GOVT_ID")) score += WEIGHTS.verification * 0.4;
  if (types.has("SKILL_TEST")) score += WEIGHTS.verification * 0.2;

  return Math.round(score);
}

async function computeDisputePenalty(workerId: string): Promise<number> {
  // Counts disputes tied to this worker's bookings — kept lightweight
  // (count-based) rather than severity-weighted at MVP; refine once
  // there's real dispute-outcome data to calibrate against.
  const workerBookingIds = await Booking.find({ worker: workerId }).distinct("_id");
  const { Dispute } = await import("../models/Dispute");
  const disputeCount = await Dispute.countDocuments({
    booking: { $in: workerBookingIds },
    status: { $ne: "RESOLVED" }, // resolved-in-worker's-favor disputes shouldn't be a lasting penalty; MVP simplification: only open/under-review count
  });

  return Math.min(WEIGHTS.penaltyCeiling / 2, disputeCount * 5);
}

/**
 * Full recomputation — called after any trust-affecting event
 * (booking completed, review submitted, verification approved,
 * dispute filed). Writes both the denormalized cache on WorkerProfile
 * AND an append-only TrustScoreSnapshot (Part 15: "why did my score
 * drop" must be answerable).
 */
async function recompute(workerId: string): Promise<number> {
  const worker = await WorkerProfile.findById(workerId);
  if (!worker) return 0;

  // New workers (never completed a job) get the flat baseline —
  // not scored against the full formula, which would unfairly punish
  // zero-history as if it were bad history (Part 3: "New — Verified"
  // framing, not a low score next to established workers).
  if (worker.isNewWorker) {
    const verificationPoints = await computeVerificationScore(workerId);
    const score = NEW_WORKER_BASELINE + verificationPoints;
    await persist(workerId, score, {
      verificationPoints,
      ratingPoints: 0,
      completedJobsPoints: 0,
      reliabilityPoints: 0,
      penaltyPoints: 0,
    });
    return score;
  }

  const reviews = await Review.find({ worker: workerId, reviewerRole: "CUSTOMER" });
  const ratingCount = reviews.length;
  const rawAvg = ratingCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;
  const adjustedRating = ratingCount > 0 ? bayesianRating(rawAvg, ratingCount) : PLATFORM_AVERAGE_RATING;
  const ratingPoints = Math.round((adjustedRating / 5) * WEIGHTS.rating);

  const verificationPoints = await computeVerificationScore(workerId);
  const completedJobsPoints = completedJobsScore(worker.completedJobsCount);
  const { score: reliabilityPoints, penalty: reliabilityPenalty } = await computeReliabilityScore(workerId);
  const disputePenalty = await computeDisputePenalty(workerId);

  const penaltyPoints = Math.min(WEIGHTS.penaltyCeiling, reliabilityPenalty + disputePenalty);

  const rawScore =
    verificationPoints + ratingPoints + completedJobsPoints + reliabilityPoints - penaltyPoints;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Update the worker's own visible average/count too, while we're here.
  worker.averageRating = Math.round(rawAvg * 10) / 10;
  worker.ratingCount = ratingCount;
  worker.trustScore = score;
  await worker.save();

  await persist(workerId, score, {
    verificationPoints,
    ratingPoints,
    completedJobsPoints,
    reliabilityPoints,
    penaltyPoints,
  });

  return score;
}

async function persist(
  workerId: string,
  score: number,
  breakdown: {
    verificationPoints: number;
    ratingPoints: number;
    completedJobsPoints: number;
    reliabilityPoints: number;
    penaltyPoints: number;
  }
): Promise<void> {
  await WorkerProfile.findByIdAndUpdate(workerId, { $set: { trustScore: score } });
  await TrustScoreSnapshot.create({ worker: workerId, score, breakdown, computedAt: new Date() });
}

async function getHistory(workerId: string, limit = 20) {
  return TrustScoreSnapshot.find({ worker: workerId }).sort({ computedAt: -1 }).limit(limit);
}

export const trustScoreService = { recompute, getHistory };