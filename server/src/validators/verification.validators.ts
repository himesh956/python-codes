import { z } from "zod";
import { VERIFICATION_TYPES } from "../constants/workerEnums";

export const submitVerificationSchema = z.object({
  body: z.object({
    type: z.enum(VERIFICATION_TYPES),
    evidenceRef: z.string().optional(), // e.g. Cloudinary URL for GOVT_ID
  }),
});

export const reviewVerificationSchema = z.object({
  body: z.object({
    approve: z.boolean(),
  }),
});