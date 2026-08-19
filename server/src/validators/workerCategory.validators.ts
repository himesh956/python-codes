import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    parentCategory: z.string().optional(),
    icon: z.string().optional(),
    requiresSkillTest: z.boolean().optional(),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];