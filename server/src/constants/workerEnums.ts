export const AVAILABILITY_STATES = [
  "AVAILABLE_NOW",
  "AVAILABLE_TODAY",
  "BUSY",
  "OFFLINE",
] as const;
export type AvailabilityState = (typeof AVAILABILITY_STATES)[number];

export const WAGE_TYPES = ["DAILY", "HOURLY", "PER_JOB"] as const;
export type WageType = (typeof WAGE_TYPES)[number];

export const BOOKING_STATUSES = [
  "REQUESTED",
  "ACCEPTED",
  "DECLINED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const VERIFICATION_TYPES = ["PHONE", "GOVT_ID", "SKILL_TEST"] as const;
export type VerificationType = (typeof VERIFICATION_TYPES)[number];

export const VERIFICATION_STATUSES = ["PENDING", "VERIFIED", "REJECTED"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const DISPUTE_STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED"] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const REVIEWER_ROLES = ["CUSTOMER", "WORKER"] as const;
export type ReviewerRole = (typeof REVIEWER_ROLES)[number];

/**
 * Structured tags per Phase 5 of the revised brief — different sets
 * depending on who's rating whom. Kept as fixed enums (not free text)
 * so they're aggregatable later (e.g. "90% of reviews mention Punctual").
 */
export const WORKER_RATING_TAGS = [
  "Paid on time",
  "Good communication",
  "Professional",
  "Safe workplace",
  "Clear work requirements",
] as const;
export type WorkerRatingTag = (typeof WORKER_RATING_TAGS)[number];

export const CUSTOMER_RATING_TAGS = [
  "Professional worker",
  "Good quality work",
  "Punctual",
  "Good communication",
  "Reliable",
] as const;
export type CustomerRatingTag = (typeof CUSTOMER_RATING_TAGS)[number];

/** Dispute categories per Phase 10 of the revised brief. */
export const DISPUTE_CATEGORIES = [
  "PAYMENT_ISSUE",
  "FAKE_JOB",
  "ABUSIVE_BEHAVIOR",
  "NO_SHOW",
  "WRONG_WORK_DESCRIPTION",
  "OTHER",
] as const;
export type DisputeCategory = (typeof DISPUTE_CATEGORIES)[number];