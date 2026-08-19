import { z } from "zod";

export const translateMessageSchema = z.object({
  body: z.object({
    targetLanguage: z.enum(["HI", "EN"]),
  }),
});