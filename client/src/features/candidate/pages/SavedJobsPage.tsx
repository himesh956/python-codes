import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { listSavedJobs, unsaveJob } from "@/features/savedJobs/api/savedJobs.api";
import { EmptyState } from "@/components/EmptyState";

export default function SavedJobsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: saved, isLoading } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: listSavedJobs,
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId: string) => unsaveJob(jobId),
    onSuccess: () => {
      toast.success("Removed from saved jobs");
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Saved Jobs</h1>

      <div className="mt-4">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
        ) : saved && saved.length > 0 ? (
          <div className="space-y-3">
            {saved.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
              >
                <Link to={`/candidate/jobs/${entry.job._id}`} className="hover:text-brand-700">
                  <p className="font-medium text-slate-900">{entry.job.title}</p>
                  <p className="text-sm text-slate-500">
                    {entry.job.company?.name} · {entry.job.location.city}
                  </p>
                </Link>
                <button
                  onClick={() => unsaveMutation.mutate(entry.job._id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No saved jobs yet"
            description="Save jobs while browsing to find them here later."
            actionLabel="Explore Jobs"
            onAction={() => navigate("/candidate/jobs")}
          />
        )}
      </div>
    </div>
  );
}