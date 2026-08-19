import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getMyApplications, withdrawApplication } from "@/features/applications/api/applications.api";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useNavigate } from "react-router-dom";

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: getMyApplications,
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => withdrawApplication(id),
    onSuccess: () => {
      toast.success("Application withdrawn");
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: () => toast.error("Could not withdraw application"),
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">My Applications</h1>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{app.job.title}</p>
                  <p className="text-sm text-slate-500">
                    {app.job.location.city} · Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  {!["REJECTED", "WITHDRAWN"].includes(app.status) && (
                    <button
                      onClick={() => withdrawMutation.mutate(app._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No applications yet"
            description="Start applying to jobs to track them here."
            actionLabel="Explore Jobs"
            onAction={() => navigate("/candidate/jobs")}
          />
        )}
      </div>
    </div>
  );
}