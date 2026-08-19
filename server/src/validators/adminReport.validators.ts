import { z } from "zod";

export const resolveReportSchema = z.object({
  body: z.object({
    status: z.enum(["REVIEWED", "DISMISSED"]),
  }),
});