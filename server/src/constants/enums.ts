export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const WORK_MODES = ["ON_SITE", "HYBRID", "REMOTE"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const JOB_STATUSES = ["DRAFT", "PUBLISHED", "PAUSED", "CLOSED", "EXPIRED"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const APPLICATION_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "REJECTED",
  "WITHDRAWN",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const INTERVIEW_MODES = ["ONLINE", "IN_PERSON", "PHONE"] as const;
export type InterviewMode = (typeof INTERVIEW_MODES)[number];

export const INTERVIEW_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];
