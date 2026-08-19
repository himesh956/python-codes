import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Share2 } from "lucide-react";
import { listMyJobs, updateJobStatus } from "../api/employer.api";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

const NEXT_STATUS: Record<string, string[]> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["PAUSED", "CLOSED"],
  PAUSED: ["PUBLISHED", "CLOSED"],
  CLOSED: [],
  EXPIRED: [],
};

export default function MyJobsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["my-jobs"],
    queryFn: listMyJobs,
  });

  const statusMutation = useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: string }) =>
      updateJobStatus(jobId, status),
    onSuccess: () => {
      toast.success("Job status updated");
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
    },
    onError: () => toast.error("Could not update job status"),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">My Jobs</h1>
        <Link
          to="/employer/jobs/create"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Post a Job
        </Link>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <button
                    onClick={() => navigate(`/employer/jobs/${job._id}/applicants`)}
                    className="font-medium text-slate-900 hover:text-brand-700"
                  >
                    {job.title}
                  </button>
                  <p className="text-sm text-slate-500">
                    {job.location.city} · {job.viewCount} views
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/employer/jobs/${job._id}/poster`}
                    className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
                  >
                    <Share2 size={12} /> Share
                  </Link>
                  <StatusBadge status={job.status} />
                  {NEXT_STATUS[job.status]?.map((next) => (
                    <button
                      key={next}
                      onClick={() => statusMutation.mutate({ jobId: job._id, status: next })}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      Move to {next}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No jobs posted yet"
            description="Post your first job to start receiving applications."
            actionLabel="Post a Job"
            onAction={() => navigate("/employer/jobs/create")}
          />
        )}
      </div>
    </div>
  );
}