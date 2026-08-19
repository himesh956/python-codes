import { api } from "@/lib/api";
import { WorkerProfile } from "@/features/workers/types";

export interface TrustedWorkerEntry {
  worker: WorkerProfile;
  jobsCompletedWithThisWorker: number;
}

export async function getMyTrustedWorkers(): Promise<TrustedWorkerEntry[]> {
  const res = await api.get("/trusted-workers/my");
  return res.data.data.trustedWorkers;
}