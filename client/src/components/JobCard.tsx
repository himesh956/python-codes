import { Link } from "react-router-dom";
import { MapPin, Briefcase } from "lucide-react";
import { Job } from "@/features/jobs/types";

function formatSalary(min?: number, max?: number, currency = "INR"): string {
  if (!min && !max) return "Salary not disclosed";
  const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
  if (min && max) return `${fmt(min)} - ${fmt(max)} ${currency}`;
  return `${fmt(min ?? max ?? 0)} ${currency}`;
}

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      to={`/candidate/jobs/${job._id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-slate-900">{job.title}</h3>
          <p className="text-sm text-slate-500">{job.company?.name}</p>
        </div>
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
          {job.employmentType.replace("_", " ")}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin size={14} /> {job.location.city} · {job.workMode.replace("_", " ")}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={14} /> {job.experienceMinYears}+ yrs
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {skill}
          </span>
        ))}
      </div>

      <p className="mt-3 text-sm font-medium text-slate-700">
        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
      </p>
    </Link>
  );
}