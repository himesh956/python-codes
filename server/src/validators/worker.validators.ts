import { z } from "zod";
import { AVAILABILITY_STATES, WAGE_TYPES } from "../constants/workerEnums";

const locationSchema = z.object({
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),

  // Optional approximate coordinates
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const upsertWorkerProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),

    phone: z.string().max(20).optional(),

    bio: z.string().max(500).optional(),

    categories: z
      .array(z.string().min(1))
      .min(1, "Select at least one category")
      .optional(),

    experienceYears: z
      .number()
      .min(0)
      .max(60)
      .optional(),

    baseLocation: locationSchema.optional(),

    serviceAreaRadiusKm: z
      .number()
      .min(1)
      .max(50)
      .optional(),

    wageExpectation: z
      .object({
        type: z.enum(WAGE_TYPES),
        amount: z.number().min(0),
      })
      .optional(),
  }),
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    availabilityState: z.enum(AVAILABILITY_STATES),
  }),
});

export const workerSearchQuerySchema = z.object({
  query: z.object({
    category: z.string().optional(),

    city: z.string().optional(),

    minWage: z.coerce.number().min(0).optional(),

    maxWage: z.coerce.number().min(0).optional(),

    minRating: z
      .coerce
      .number()
      .min(0)
      .max(5)
      .optional(),

    minTrustScore: z
      .coerce
      .number()
      .min(0)
      .max(100)
      .optional(),

    availableNow: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => v === "true"),

    sort: z
      .enum([
        "ranked",
        "rating_desc",
        "wage_asc",
        "wage_desc",
        "experience_desc",
      ])
      .optional(),

    // Geolocation search
    latitude: z.coerce
      .number()
      .min(-90)
      .max(90)
      .optional(),

    longitude: z.coerce
      .number()
      .min(-180)
      .max(180)
      .optional(),

    radiusKm: z.coerce
      .number()
      .min(1)
      .max(100)
      .default(10),

    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(20),
  }),
});

export type UpsertWorkerProfileInput =
  z.infer<typeof upsertWorkerProfileSchema>["body"];

export type WorkerSearchQuery =
  z.infer<typeof workerSearchQuerySchema>["query"];