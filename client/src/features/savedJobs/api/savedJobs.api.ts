import { api } from "@/lib/api";

export interface SavedJobEntry {
  _id: string;
  job: {
    _id: string;
    title: string;
    location: { city: string };
    employmentType: string;
    workMode: string;
    company?: { name: string; logoUrl?: string };
  };
}

export async function listSavedJobs(): Promise<SavedJobEntry[]> {
  const res = await api.get("/saved-jobs");
  return res.data.data.saved;
}

export async function saveJob(jobId: string): Promise<void> {
  await api.post("/saved-jobs", { jobId });
}

export async function unsaveJob(jobId: string): Promise<void> {
  await api.delete(`/saved-jobs/${jobId}`);
}