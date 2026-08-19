import { api } from "@/lib/api";
import { AdminDashboardData, AdminUser, AdminJob, AuditLogEntry, PlatformOverview } from "../types";

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const res = await api.get("/admin/dashboard");
  return res.data.data;
}

export async function getAnalyticsDashboard(): Promise<AdminDashboardData> {
  const res = await api.get("/admin/analytics/dashboard");
  return res.data.data;
}

export async function getTopSkills(): Promise<{ skill: string; count: number }[]> {
  const res = await api.get("/admin/analytics/top-skills");
  return res.data.data;
}

export async function getAverageCTCByRole(): Promise<{ role: string; avgCTC: number }[]> {
  const res = await api.get("/admin/analytics/avg-ctc-by-role");
  return res.data.data;
}

export async function getAverageCTCByLocation(): Promise<{ location: string; avgCTC: number }[]> {
  const res = await api.get("/admin/analytics/avg-ctc-by-location");
  return res.data.data;
}

export const getHiringTrends = async (): Promise<
  { month: string; applications: number; offers: number }[]
> => {
  const res = await api.get("/admin/analytics/hiring-trends");
  return res.data.data;
};

export async function getLocationWiseJobs(): Promise<{ city: string; count: number }[]> {
  const res = await api.get("/admin/analytics/location-wise-jobs");
  return res.data.data;
}

export async function getCandidateSkillDistribution(): Promise<{ skill: string; count: number }[]> {
  const res = await api.get("/admin/analytics/candidate-skills");
  return res.data.data;
}

export async function listUsers(params: {
  role?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: AdminUser[]; total: number }> {
  const res = await api.get("/admin/users", { params });
  return { users: res.data.data, total: res.data.meta.total };
}

export async function setUserActive(userId: string, isActive: boolean): Promise<AdminUser> {
  const res = await api.patch(`/admin/users/${userId}/active`, { isActive });
  return res.data.data.user;
}

export async function listJobsForModeration(params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ jobs: AdminJob[]; total: number }> {
  const res = await api.get("/admin/jobs", { params });
  return { jobs: res.data.data, total: res.data.meta.total };
}

export async function approveJob(jobId: string): Promise<AdminJob> {
  const res = await api.patch(`/admin/jobs/${jobId}/approve`);
  return res.data.data.job;
}

export async function rejectJob(jobId: string, reason?: string): Promise<AdminJob> {
  const res = await api.patch(`/admin/jobs/${jobId}/reject`, { reason });
  return res.data.data.job;
}

export async function listAuditLogs(params: {
  page?: number;
  limit?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  const res = await api.get("/admin/audit-logs", { params });
  return { logs: res.data.data, total: res.data.meta.total };
}