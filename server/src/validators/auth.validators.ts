import { z } from "zod";
import { ROLES } from "../constants/roles";

/**
 * Only CANDIDATE and EMPLOYER are self-registrable. ADMIN accounts are
 * created out-of-band (seed script / another admin) — never through
 * the public register endpoint.
 */
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long"),
    role: z.enum([ROLES.CANDIDATE, ROLES.EMPLOYER]),
    fullName: z.string().min(2, "Full name is required").max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(72),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
