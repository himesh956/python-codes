import { z } from "zod";

export const createReportSchema = z.object({
  body: z.object({
    targetType: z.enum(["USER", "JOB", "WORKER_PROFILE"]),
    targetId: z.string().min(1),
    reason: z.enum(["FAKE_PROFILE", "INAPPROPRIATE_BEHAVIOR", "SCAM_OR_FRAUD", "SPAM", "OTHER"]),
    details: z.string().max(500).optional(),
  }),
});

export const blockUserSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
  }),
});