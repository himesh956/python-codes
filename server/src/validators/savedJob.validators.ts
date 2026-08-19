import { z } from "zod";

export const saveJobSchema = z.object({
  body: z.object({
    jobId: z.string().min(1, "jobId is required"),
  }),
});
