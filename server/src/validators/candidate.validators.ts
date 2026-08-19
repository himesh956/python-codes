import { z } from "zod";

const locationSchema = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  fieldOfStudy: z.string().optional(),
  startYear: z.number().int().optional(),
  endYear: z.number().int().optional(),
  grade: z.string().optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  link: z.string().url().optional(),
  techStack: z.array(z.string()).optional(),
});

const certificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().optional(),
  issuedAt: z.coerce.date().optional(),
  credentialUrl: z.string().url().optional(),
});

export const updateCandidateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    phone: z.string().max(20).optional(),
    bio: z.string().max(1000).optional(),
    currentLocation: locationSchema.optional(),
    preferredLocations: z.array(locationSchema).optional(),
    skills: z.array(z.string().min(1)).max(50).optional(),
    education: z.array(educationSchema).optional(),
    experience: z.array(experienceSchema).optional(),
    projects: z.array(projectSchema).optional(),
    certifications: z.array(certificationSchema).optional(),
    expectedCTC: z.number().min(0).optional(),
    noticePeriodDays: z.number().int().min(0).optional(),
    jobPreferences: z
      .object({
        employmentTypes: z.array(z.string()).optional(),
        workModes: z.array(z.string()).optional(),
      })
      .optional(),
    portfolioUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    linkedinUrl: z.string().url().optional(),
  }),
});

export type UpdateCandidateProfileInput = z.infer<typeof updateCandidateProfileSchema>["body"];
