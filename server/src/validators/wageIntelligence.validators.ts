import { z } from "zod";

export const wageEstimateQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().min(1),
    city: z.string().min(1),
    experienceYears: z.coerce.number().min(0).max(60).default(0),
  }),
});