import { Booking } from "../models/Booking";
import { Review } from "../models/Review";
import { User } from "../models/User";
import mongoose from "mongoose";

interface FraudFlag {
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  detail: string;
}

/**
 * Rule-based only, per Part 9/12 of the product plan — ML-based fraud
 * detection is explicitly deferred to V2 pending real labeled abuse
 * data. These are the specific threats named in Part 12: review-
 * velocity anomalies and booking-request spam. Flags are surfaced to
 * admins for manual review, never used to auto-ban — a false positive
 * auto-banning a legitimate worker/customer would be far worse than a
 * missed detection at this stage.
 */
async function checkReviewVelocity(workerId: string): Promise<FraudFlag | null> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentReviewCount = await Review.countDocuments({
    worker: workerId,
    reviewerRole: "CUSTOMER",
    createdAt: { $gte: oneHourAgo },
  });

  if (recentReviewCount >= 5) {
    return {
      type: "REVIEW_VELOCITY_ANOMALY",
      severity: "MEDIUM",
      detail: `${recentReviewCount} reviews received within the last hour`,
    };
  }
  return null;
}

async function checkBookingSpam(customerUserId: string): Promise<FraudFlag | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCount = await Booking.countDocuments({
    customer: customerUserId,
    createdAt: { $gte: today },
  });

  if (todayCount >= 15) {
    return {
      type: "BOOKING_REQUEST_SPAM",
      severity: "HIGH",
      detail: `${todayCount} booking requests sent today`,
    };
  }
  return null;
}

/**
 * Cheap duplicate-account heuristic: same phone number (if present)
 * across multiple User records shouldn't be possible given the schema,
 * but this checks for near-duplicate email patterns as a soft signal
 * (e.g. user+1@test.com, user+2@test.com) — genuinely simple, no
 * device fingerprinting infra needed at MVP.
 */
async function checkSuspiciousEmailPattern(email: string): Promise<FraudFlag | null> {
  const baseEmail = email.split("+")[0].replace(/\./g, "");
  const domain = email.split("@")[1];
  if (!domain) return null;

  const similarAccounts = await User.countDocuments({
    email: new RegExp(`^${escapeRegex(baseEmail)}.*@${escapeRegex(domain)}$`, "i"),
  });

  if (similarAccounts >= 3) {
    return {
      type: "POSSIBLE_DUPLICATE_ACCOUNTS",
      severity: "LOW",
      detail: `${similarAccounts} accounts share a similar email pattern`,
    };
  }
  return null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Aggregated check, called from admin tooling — not on every request (too expensive). */
async function runChecksForWorker(workerId: string): Promise<FraudFlag[]> {
  const flags = await Promise.all([checkReviewVelocity(workerId)]);
  return flags.filter((f): f is FraudFlag => f !== null);
}

async function runChecksForCustomer(userId: string, email: string): Promise<FraudFlag[]> {
  const flags = await Promise.all([checkBookingSpam(userId), checkSuspiciousEmailPattern(email)]);
  return flags.filter((f): f is FraudFlag => f !== null);
}

export const fraudDetectionService = { runChecksForWorker, runChecksForCustomer };