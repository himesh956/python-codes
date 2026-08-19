import { z } from "zod";

export const startConversationSchema = z.object({
  body: z.object({
    otherUserId: z.string().min(1),
    contextType: z.enum(["BOOKING", "APPLICATION", "JOB", "GENERAL"]),
    contextId: z.string().optional(),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    text: z.string().min(1).max(2000),
    originalLanguage: z.enum(["HI", "EN"]).optional(),
  }),
});