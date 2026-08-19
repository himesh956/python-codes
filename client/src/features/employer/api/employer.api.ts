import { api } from "@/lib/api";
import { EmployerProfile, Company, CreateJobPayload, EmployerJob, Applicant } from "../types";

export async function getMyEmployerProfile(): Promise<EmployerProfile> {
  const res = await api.get("/employers/profile");
  return res.data.data.profile;
}

export async function updateMyCompany(payload: Partial<Company>): Promise<Company> {
  const res = await api.put("/employers/company", payload);
  return res.data.data.company;
}

export async function createJob(payload: CreateJobPayload) {
  const res = await api.post("/jobs", payload);
  return res.data.data.job;
}

export async function updateJobStatus(jobId: string, status: string) {
  const res = await api.patch(`/jobs/${jobId}/status`, { status });
  return res.data.data.job;
}

export async function listMyJobs(): Promise<EmployerJob[]> {
  const res = await api.get("/jobs/employer/mine");
  return res.data.data.jobs;
}

export async function listApplicants(jobId: string): Promise<Applicant[]> {
  const res = await api.get(`/applications/job/${jobId}`);
  return res.data.data;
}

export async function updateApplicationStatus(applicationId: string, status: string, note?: string) {
  const res = await api.patch(`/applications/${applicationId}/status`, { status, note });
  return res.data.data.application;
}