import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getMyCandidateProfile } from "../api/candidate.api";
import { getMyApplications } from "@/features/applications/api/applications.api";
import { JobCard } from "@/components/JobCard";
import { getRecommendations } from "@/features/recommendations/api/recommendations.api";

export default function CandidateDashboardPage() {
  const { data: profileData } = useQuery({
    queryKey: ["candidate-profile"],
    queryFn: getMyCandidateProfile,
  });
  const { data: applications } = useQuery({
    queryKey: ["my-applications"],
    queryFn: getMyApplications,
  });
  const { data: recommendations, isLoading: recLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => getRecommendations(6),
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">
        Welcome back{profileData ? `, ${profileData.profile.fullName}` : ""}
      </h1>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Profile Completion</p>
          <p className="mt-1 text-2xl font-semibold text-brand-700">
            {profileData?.profileCompletion ?? 0}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total Applications</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {applications?.length ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Active (non-final) Applications</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {applications?.filter((a) => !["REJECTED", "WITHDRAWN"].includes(a.status)).length ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recommended for you</h2>
          <Link to="/candidate/jobs" className="text-sm text-brand-600 hover:underline">
            View all jobs
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-100" />
            ))
          ) : recommendations && recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <div key={rec.job._id} className="relative">
                <JobCard job={rec.job} />
                <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {rec.matchPercent}% Match
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Complete your profile (skills, location, expected CTC) to see personalized recommendations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}