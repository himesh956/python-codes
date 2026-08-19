import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listMyJobs, getMyEmployerProfile } from "../api/employer.api";

export default function EmployerDashboardPage() {
  const { data: profile } = useQuery({
    queryKey: ["employer-profile"],
    queryFn: getMyEmployerProfile,
  });
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["my-jobs"],
    queryFn: listMyJobs,
  });

  const totalJobs = jobs?.length ?? 0;
  const activeJobs = jobs?.filter((j) => j.status === "PUBLISHED").length ?? 0;

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">
        Welcome back{profile ? `, ${profile.fullName}` : ""}
      </h1>
      <p className="text-sm text-slate-500">{profile?.company?.name}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total Jobs</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {isLoading ? "…" : totalJobs}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Active Jobs</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">
            {isLoading ? "…" : activeJobs}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total Views (all jobs)</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {isLoading ? "…" : jobs?.reduce((sum, j) => sum + j.viewCount, 0) ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          to="/employer/jobs"
          className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Manage My Jobs
        </Link>
      </div>
    </div>
  );
}