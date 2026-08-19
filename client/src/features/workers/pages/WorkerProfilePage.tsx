import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Briefcase, ShieldCheck } from "lucide-react";
import { getWorkerById } from "../api/workers.api";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AvailabilityDot } from "@/components/ui/AvailabilityDot";
import { TrustScoreBadge } from "@/components/ui/TrustScoreBadge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery as useReviewsQuery } from "@tanstack/react-query";

interface ReviewItem {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

async function fetchReviews(workerId: string): Promise<ReviewItem[]> {
  const res = await api.get(`/reviews/worker/${workerId}`);
  return res.data.data.reviews;
}

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: worker, isLoading } = useQuery({
    queryKey: ["worker", id],
    queryFn: () => getWorkerById(id!),
    enabled: Boolean(id),
  });

  const { data: reviews } = useReviewsQuery({
    queryKey: ["worker-reviews", id],
    queryFn: () => fetchReviews(id!),
    enabled: Boolean(id),
  });

  if (isLoading) return <Skeleton className="h-96" />;
  if (!worker) return <p className="text-sm text-ink-500">Worker not found.</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl font-semibold text-brand-700">
            {worker.photoUrl ? (
              <img src={worker.photoUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
            ) : (
              worker.fullName.charAt(0)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold text-ink-900">{worker.fullName}</p>
            <p className="text-sm text-ink-500">{worker.categories.map((c) => c.name).join(", ")}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <TrustScoreBadge score={worker.trustScore} isNew={worker.isNewWorker} />
              <AvailabilityDot state={worker.availabilityState} />
            </div>
          </div>
        </div>

        {worker.bio && <p className="mt-4 text-sm text-ink-700">{worker.bio}</p>}

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-600">
          <span className="flex items-center gap-1">
            <MapPin size={15} /> {worker.baseLocation.city} · {worker.serviceAreaRadiusKm}km radius
          </span>
          <span className="flex items-center gap-1">
            <Briefcase size={15} /> {worker.experienceYears} years experience
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-ink-50 p-3">
          <div>
            {worker.ratingCount > 0 ? (
              <Badge variant="rating">
                {worker.averageRating.toFixed(1)} · {worker.ratingCount} reviews ·{" "}
                {worker.completedJobsCount} jobs completed
              </Badge>
            ) : (
              <Badge variant="neutral">No completed jobs yet</Badge>
            )}
          </div>
          <p className="font-display text-lg font-bold text-brand-700">
            ₹{worker.wageExpectation.amount.toLocaleString("en-IN")}
            {worker.wageExpectation.type === "DAILY"
              ? "/day"
              : worker.wageExpectation.type === "HOURLY"
                ? "/hr"
                : "/job"}
          </p>
        </div>

        <Link to={`/customer/book/${worker._id}`} className="mt-4 block">
          <Button fullWidth size="lg">
            Book {worker.fullName.split(" ")[0]}
          </Button>
        </Link>
      </Card>

      <Card>
        <p className="font-display font-semibold text-ink-900">Reviews</p>
        <div className="mt-3 space-y-3">
          {reviews && reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r._id} className="border-b border-ink-100 pb-3 last:border-0">
                <div className="flex items-center gap-1 text-amber-500">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                {r.comment && <p className="mt-1 text-sm text-ink-600">{r.comment}</p>}
                <p className="mt-1 text-xs text-ink-400">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-400">No reviews yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}