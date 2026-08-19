import { z } from "zod";

export const processTranscriptSchema = z.object({
  body: z.object({
    transcript: z.string().min(5).max(1000),
  }),
});