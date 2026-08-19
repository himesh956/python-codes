import { z } from "zod";
import { REVIEWER_ROLES, WORKER_RATING_TAGS, CUSTOMER_RATING_TAGS } from "../constants/workerEnums";

export const createReviewSchema = z.object({
  body: z
    .object({
      bookingId: z.string().min(1),
      reviewerRole: z.enum(REVIEWER_ROLES),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(500).optional(),
      tags: z.array(z.string()).max(5).default([]),
    })
    .refine(
      (data) => {
        const allowedTags: readonly string[] =
          data.reviewerRole === "CUSTOMER" ? WORKER_RATING_TAGS : CUSTOMER_RATING_TAGS;
        return data.tags.every((t) => allowedTags.includes(t));
      },
      { message: "One or more tags are not valid for this reviewer role", path: ["tags"] }
    ),
});

export const reportReviewSchema = z.object({
  body: z.object({
    reason: z.string().min(5).max(500),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>["body"];