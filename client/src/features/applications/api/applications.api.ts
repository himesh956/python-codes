import { api } from "@/lib/api";
import { Application } from "../types";

export async function applyToJob(jobId: string): Promise<Application> {
  const res = await api.post("/applications", { jobId });
  return res.data.data.application;
}

export async function getMyApplications(): Promise<Application[]> {
  const res = await api.get("/applications/my");
  return res.data.data.applications;
}

export async function withdrawApplication(applicationId: string): Promise<Application> {
  const res = await api.patch(`/applications/${applicationId}/withdraw`);
  return res.data.data.application;
}