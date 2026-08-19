import { api } from "@/lib/api";
import { Job, JobSearchFilters, PaginationMeta } from "../types";

export async function searchJobs(
  filters: JobSearchFilters
): Promise<{ jobs: Job[]; meta: PaginationMeta }> {
  const res = await api.get("/jobs", { params: filters });
  return { jobs: res.data.data, meta: res.data.meta };
}

export async function getJobById(id: string): Promise<Job> {
  const res = await api.get(`/jobs/${id}`);
  return res.data.data.job;
}