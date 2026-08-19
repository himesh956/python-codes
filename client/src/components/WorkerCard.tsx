import { Link } from "react-router-dom";
import { MapPin, Briefcase, Star } from "lucide-react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { AvailabilityDot } from "./ui/AvailabilityDot";
import { TrustScoreBadge } from "./ui/TrustScoreBadge";
import { WorkerProfile } from "@/features/workers/types";

function formatWage(w: WorkerProfile["wageExpectation"]): string {
  const suffix = w.type === "DAILY" ? "/day" : w.type === "HOURLY" ? "/hr" : "/job";
  return `₹${w.amount.toLocaleString("en-IN")}${suffix}`;
}

/**
 * Visual priority order per the product plan's UX hierarchy (Part 17):
 * photo -> name/category -> Trust Score badge -> availability dot ->
 * distance -> wage. Star rating shown as a supporting detail, NOT the
 * primary trust signal (that's the Trust Score badge's job).
 */
export function WorkerCard({ worker }: { worker: WorkerProfile }) {
  return (
    <Link to={`/customer/workers/${worker._id}`}>
      <Card hoverable className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg font-semibold text-brand-700">
            {worker.photoUrl ? (
              <img src={worker.photoUrl} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              worker.fullName.charAt(0)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-semibold text-ink-900">{worker.fullName}</p>
            <p className="truncate text-xs text-ink-500">
              {worker.categories.map((c) => c.name).join(", ")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TrustScoreBadge score={worker.trustScore} isNew={worker.isNewWorker} />
          <AvailabilityDot state={worker.availabilityState} />
        </div>

        <div className="flex items-center justify-between text-xs text-ink-500">
          <span className="flex items-center gap-1">
            <MapPin size={13} /> {worker.baseLocation.city}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase size={13} /> {worker.experienceYears}+ yrs
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 pt-3">
          <div className="flex items-center gap-1">
            {worker.ratingCount > 0 ? (
              <Badge variant="rating">
                {worker.averageRating.toFixed(1)} ({worker.completedJobsCount} jobs)
              </Badge>
            ) : (
              <span className="text-xs text-ink-400">No jobs yet</span>
            )}
          </div>
          <p className="font-display font-semibold text-brand-700">{formatWage(worker.wageExpectation)}</p>
        </div>
      </Card>
    </Link>
  );
}