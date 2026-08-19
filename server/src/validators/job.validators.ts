import { z } from "zod";
import { EMPLOYMENT_TYPES, WORK_MODES, JOB_STATUSES } from "../constants/enums";

const locationSchema = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
});

const jobBodySchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().min(20),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  skills: z.array(z.string().min(1)).min(1, "At least one skill is required"),
  experienceMinYears: z.number().min(0).default(0),
  experienceMaxYears: z.number().min(0).optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  workMode: z.enum(WORK_MODES),
  location: locationSchema,
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryCurrency: z.string().optional(),
  openings: z.number().int().min(1).default(1),
  applicationDeadline: z.coerce.date().optional(),
  benefits: z.array(z.string()).optional(),
  educationRequirements: z.string().optional(),
});

function validSalaryRange(data: { salaryMin?: number; salaryMax?: number }): boolean {
  return (
    data.salaryMin === undefined || data.salaryMax === undefined || data.salaryMax >= data.salaryMin
  );
}

export const createJobSchema = z.object({
  body: jobBodySchema.refine(validSalaryRange, {
    message: "salaryMax must be greater than or equal to salaryMin",
    path: ["salaryMax"],
  }),
});

export const updateJobSchema = z.object({
  body: jobBodySchema.partial().refine(validSalaryRange, {
    message: "salaryMax must be greater than or equal to salaryMin",
    path: ["salaryMax"],
  }),
});

export const updateJobStatusSchema = z.object({
  body: z.object({
    status: z.enum(JOB_STATUSES),
  }),
});

export const jobSearchQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    city: z.string().optional(),
    skills: z.string().optional(), // comma-separated
    employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
    workMode: z.enum(WORK_MODES).optional(),
    salaryMin: z.coerce.number().min(0).optional(),
    salaryMax: z.coerce.number().min(0).optional(),
    experienceMax: z.coerce.number().min(0).optional(),
    sort: z.enum(["latest", "salary_desc", "salary_asc"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export type CreateJobInput = z.infer<typeof createJobSchema>["body"];
export type UpdateJobInput = z.infer<typeof updateJobSchema>["body"];
export type JobSearchQuery = z.infer<typeof jobSearchQuerySchema>["query"];
