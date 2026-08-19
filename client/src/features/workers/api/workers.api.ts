import { api } from "@/lib/api";
import { WorkerProfile, WorkerSearchFilters, WorkerCategory } from "../types";
import { PaginationMeta } from "@/features/jobs/types";

export async function listCategories(): Promise<WorkerCategory[]> {
  const res = await api.get("/worker-categories");
  return res.data.data.categories;
}

export async function searchWorkers(
  filters: WorkerSearchFilters
): Promise<{ workers: WorkerProfile[]; meta: PaginationMeta }> {
  const res = await api.get("/workers", { params: filters });
  return { workers: res.data.data, meta: res.data.meta };
}

export async function getWorkerById(id: string): Promise<WorkerProfile> {
  const res = await api.get(`/workers/${id}`);
  return res.data.data.profile;
}

export async function getMyWorkerProfile(): Promise<WorkerProfile> {
  const res = await api.get("/workers/me");
  return res.data.data.profile;
}

export async function upsertMyWorkerProfile(payload: Record<string, unknown>): Promise<WorkerProfile> {
  const res = await api.put("/workers/me", payload);
  return res.data.data.profile;
}

export async function updateMyAvailability(availabilityState: string): Promise<WorkerProfile> {
  const res = await api.patch("/workers/me/availability", { availabilityState });
  return res.data.data.profile;
}

export async function getWageEstimate(params: {
  categoryId: string;
  city: string;
  experienceYears: number;
}) {
  const res = await api.get("/wage-intelligence/estimate", { params });
  return res.data.data.estimate as {
    p25: number;
    p50: number;
    p75: number;
    sampleSize: number;
    confidence: string;
    wageType: string;
  } | null;
}