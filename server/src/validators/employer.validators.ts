import { z } from "zod";

const locationSchema = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
});

export const updateEmployerProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    designation: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    logoUrl: z.string().url().optional(),
    about: z.string().max(2000).optional(),
    industry: z.string().max(100).optional(),
    website: z.string().url().optional(),
    locations: z.array(locationSchema).optional(),
  }),
});

export type UpdateEmployerProfileInput = z.infer<typeof updateEmployerProfileSchema>["body"];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>["body"];
