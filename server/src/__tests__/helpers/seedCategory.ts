import { WorkerCategory } from "../../models/WorkerCategory";

/** Shared test helper — most worker/booking tests need at least one category to exist. */
export async function seedCategory(name = "Electrician") {
  return WorkerCategory.create({ name, requiresSkillTest: false, isActive: true });
}