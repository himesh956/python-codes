import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MapPin, Briefcase, IndianRupee, Bookmark } from "lucide-react";
import { getJobById } from "../api/jobs.api";
import { applyToJob } from "@/features/applications/api/applications.api";
import { saveJob } from "@/features/savedJobs/api/savedJobs.api";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJobById(id!),
    enabled: Boolean(id),
  });

  const applyMutation = useMutation({
    mutationFn: () => applyToJob(id!),
    onSuccess: () => {
      toast.success("Application submitted!");
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not apply to this job.";
      toast.error(message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => saveJob(id!),
    onSuccess: () => {
      toast.success("Job saved");
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
    onError: () => toast.error("Could not save this job (maybe already saved?)"),
  });

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-slate-100" />;
  if (!job) return <p className="text-sm text-slate-500">Job not found.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{job.title}</h1>
            <p className="text-sm text-slate-500">{job.company?.name}</p>
          </div>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50"
            title="Save job"
          >
            <Bookmark size={18} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <MapPin size={16} /> {job.location.city} · {job.workMode.replace("_", " ")}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase size={16} /> {job.employmentType.replace("_", " ")}
          </span>
          {(job.salaryMin || job.salaryMax) && (
            <span className="flex items-center gap-1">
              <IndianRupee size={16} />
              {job.salaryMin ? `${(job.salaryMin / 100000).toFixed(1)}L` : ""}
              {job.salaryMax ? ` - ${(job.salaryMax / 100000).toFixed(1)}L` : ""}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.skills.map((skill) => (
            <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {skill}
            </span>
          ))}
        </div>

        <p className="mt-6 whitespace-pre-line text-sm text-slate-700">{job.description}</p>

        <button
          onClick={() => applyMutation.mutate()}
          disabled={applyMutation.isPending}
          className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {applyMutation.isPending ? "Applying…" : "Apply Now"}
        </button>
      </div>
    </div>
  );
}