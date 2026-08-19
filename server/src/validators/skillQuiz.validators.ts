import { z } from "zod";

export const createQuizSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1),
    questions: z
      .array(
        z.object({
          question: z.string().min(5),
          options: z.array(z.string().min(1)).min(2).max(6),
          correctOptionIndex: z.number().int().min(0),
        })
      )
      .min(3),
    passingScore: z.number().int().min(1),
  }),
});

export const submitAttemptSchema = z.object({
  body: z.object({
    answers: z.array(z.number().int().min(0)),
  }),
});