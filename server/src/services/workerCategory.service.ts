import { WorkerCategory, IWorkerCategory } from "../models/WorkerCategory";
import { AppError } from "../utils/AppError";
import { CreateCategoryInput } from "../validators/workerCategory.validators";

/** Admin-only creation — taxonomy is curated, not user-generated (see model comment). */
async function create(input: CreateCategoryInput): Promise<IWorkerCategory> {
  const existing = await WorkerCategory.findOne({ name: input.name });
  if (existing) throw AppError.conflict("A category with this name already exists");

  return WorkerCategory.create({
    name: input.name,
    parentCategory: input.parentCategory || null,
    icon: input.icon,
    requiresSkillTest: input.requiresSkillTest ?? false,
  });
}

async function listActive(): Promise<IWorkerCategory[]> {
  return WorkerCategory.find({ isActive: true }).sort({ name: 1 });
}

async function deactivate(id: string): Promise<IWorkerCategory> {
  const category = await WorkerCategory.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!category) throw AppError.notFound("Category not found");
  return category;
}

export const workerCategoryService = { create, listActive, deactivate };