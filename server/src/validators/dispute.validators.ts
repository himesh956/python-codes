import { z } from "zod";
import { DISPUTE_CATEGORIES } from "../constants/workerEnums";

const cloudinaryUrlSchema = z
  .string()
  .url()
  .refine((url) => url.includes("res.cloudinary.com"), {
    message: "Evidence must be an uploaded file (Cloudinary URL)",
  });

export const createDisputeSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1),
    category: z.enum(DISPUTE_CATEGORIES).default("OTHER"),
    reason: z.string().min(10).max(1000),
    evidenceUrls: z.array(cloudinaryUrlSchema).max(5).optional(),
  }),
});

export const resolveDisputeSchema = z.object({
  body: z.object({
    adminResolution: z.string().min(5).max(1000),
  }),
});