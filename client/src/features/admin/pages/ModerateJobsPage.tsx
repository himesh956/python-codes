import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listJobsForModeration, approveJob, rejectJob } from "../api/admin.api";
import { StatusBadge } from "@/components/StatusBadge";

export default function ModerateJobsPage() {
  const [status, setStatus] = useState<string>("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-jobs", status],
    queryFn: () => listJobsForModeration({ status: status || undefined, limit: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: approveJob,
    onSuccess: () => {
      toast.success("Job approved and published");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (jobId: string) => rejectJob(jobId),
    onSuccess: () => {
      toast.success("Job rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Moderate Jobs</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="PAUSED">Paused</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
        ) : (
          data?.jobs.map((job) => (
            <div
              key={job._id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{job.title}</p>
                <p className="text-sm text-slate-500">{job.company?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={job.status} />
                {job.status === "DRAFT" && (
                  <button
                    onClick={() => approveMutation.mutate(job._id)}
                    className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    Approve
                  </button>
                )}
                {job.status !== "CLOSED" && (
                  <button
                    onClick={() => rejectMutation.mutate(job._id)}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Reject / Close
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}