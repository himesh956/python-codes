import { z } from "zod";
import { APPLICATION_STATUSES } from "../constants/enums";

export const createApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().min(1, "jobId is required"),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(APPLICATION_STATUSES),
    note: z.string().max(500).optional(),
  }),
});

export const listApplicantsQuerySchema = z.object({
  query: z.object({
    status: z.enum(APPLICATION_STATUSES).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>["body"];
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>["body"];
export type ListApplicantsQuery = z.infer<typeof listApplicantsQuerySchema>["query"];
