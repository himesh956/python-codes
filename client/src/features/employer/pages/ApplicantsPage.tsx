import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listApplicants, updateApplicationStatus } from "../api/employer.api";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

const NEXT_STATUS: Record<string, string[]> = {
  APPLIED: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFERED", "REJECTED"],
  OFFERED: ["REJECTED"],
  REJECTED: [],
  WITHDRAWN: [],
};

export default function ApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const queryClient = useQueryClient();

  const { data: applicants, isLoading } = useQuery({
    queryKey: ["applicants", jobId],
    queryFn: () => listApplicants(jobId!),
    enabled: Boolean(jobId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: string }) =>
      updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      toast.success("Applicant status updated");
      queryClient.invalidateQueries({ queryKey: ["applicants", jobId] });
    },
    onError: () => toast.error("Could not update applicant status"),
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Applicants</h1>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : applicants && applicants.length > 0 ? (
          <div className="space-y-3">
            {applicants.map((applicant) => (
              <div
                key={applicant._id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{applicant.candidate.fullName}</p>
                    <p className="text-sm text-slate-500">
                      Expected CTC:{" "}
                      {applicant.candidate.expectedCTC
                        ? `₹${(applicant.candidate.expectedCTC / 100000).toFixed(1)}L`
                        : "Not specified"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {applicant.candidate.skills.slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                                         <a
                      href={applicant.resume.cloudinaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs text-brand-600 hover:underline"
                    >
                      View Resume
                    </a>
                  </div>
                  <StatusBadge status={applicant.status} />
                </div>

                {NEXT_STATUS[applicant.status]?.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {NEXT_STATUS[applicant.status].map((next) => (
                      <button
                        key={next}
                        onClick={() =>
                          statusMutation.mutate({ applicationId: applicant._id, status: next })
                        }
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Move to {next}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No applicants yet" description="Check back once candidates start applying." />
        )}
      </div>
    </div>
  );
}