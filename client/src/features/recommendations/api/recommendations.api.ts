import { api } from "@/lib/api";
import { Job } from "@/features/jobs/types";

export interface JobMatch {
  job: Job;
  matchPercent: number;
  explanation: string[];
}

export async function getRecommendations(limit = 10): Promise<JobMatch[]> {
  const res = await api.get("/recommendations", { params: { limit } });
  return res.data.data.recommendations;
}