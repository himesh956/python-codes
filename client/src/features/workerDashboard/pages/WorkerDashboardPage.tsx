import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getMyWorkerProfile, updateMyAvailability } from "@/features/workers/api/workers.api";
import { getMyBookingsAsWorker, respondToBooking } from "@/features/bookings/api/bookings.api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TrustScoreBadge } from "@/components/ui/TrustScoreBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

const AVAILABILITY_OPTIONS = [
  { value: "AVAILABLE_NOW", label: "Available Now", color: "bg-available" },
  { value: "AVAILABLE_TODAY", label: "Available Today", color: "bg-soon" },
  { value: "BUSY", label: "Busy", color: "bg-busy" },
  { value: "OFFLINE", label: "Offline", color: "bg-ink-300" },
] as const;

export default function WorkerDashboardPage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-worker-profile"],
    queryFn: getMyWorkerProfile,
    retry: false,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings-worker"],
    queryFn: getMyBookingsAsWorker,
    enabled: Boolean(profile),
  });

  const availabilityMutation = useMutation({
    mutationFn: updateMyAvailability,
    onSuccess: () => {
      toast.success("Availability updated");
      queryClient.invalidateQueries({ queryKey: ["my-worker-profile"] });
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "ACCEPT" | "DECLINE" }) =>
      respondToBooking(id, action),
    onSuccess: (_, variables) => {
      toast.success(variables.action === "ACCEPT" ? "Booking accepted!" : "Booking declined");
      queryClient.invalidateQueries({ queryKey: ["my-bookings-worker"] });
    },
    onError: () => toast.error("Could not respond to this booking"),
  });

  if (profileLoading) return <Skeleton className="h-64" />;

  if (!profile) {
    return (
      <EmptyState
        title="Set up your worker profile to start getting bookings"
        description="Tell customers what you do, your wage, and your city."
        actionLabel="Create Worker Profile"
        onAction={() => (window.location.href = "/worker/onboarding")}
      />
    );
  }

  const pendingRequests = bookings?.filter((b) => b.status === "REQUESTED") ?? [];
  const activeBookings = bookings?.filter((b) => ["ACCEPTED", "IN_PROGRESS"].includes(b.status)) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">Welcome back, {profile.fullName}</h1>
          <div className="mt-1 flex items-center gap-2">
            <TrustScoreBadge score={profile.trustScore} isNew={profile.isNewWorker} />
          </div>
        </div>
        <Link to="/worker/onboarding" className="text-sm text-brand-600 hover:underline">
          Edit Profile
        </Link>
      </div>

      {/* Availability toggle — most prominent control per design direction (Part 17) */}
      <Card className="mt-4">
        <p className="text-sm font-semibold text-ink-700">Your availability</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => availabilityMutation.mutate(opt.value)}
              className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition ${
                profile.availabilityState === opt.value
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-ink-200 text-ink-600 hover:border-ink-300"
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${opt.color}`} />
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Completed Jobs" value={profile.completedJobsCount} />
        <StatCard
          label="Rating"
          value={profile.ratingCount > 0 ? `${profile.averageRating.toFixed(1)} ★` : "—"}
        />
        <StatCard label="Trust Score" value={profile.trustScore} />
        <StatCard label="Reviews" value={profile.ratingCount} />
      </div>

      {/* Incoming requests — the worker's primary action item */}
      <div className="mt-6">
        <h2 className="font-display font-semibold text-ink-900">
          Incoming Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
        </h2>
        <div className="mt-3 space-y-3">
          {bookingsLoading ? (
            <Skeleton className="h-24" />
          ) : pendingRequests.length > 0 ? (
            pendingRequests.map((b) => (
              <Card key={b._id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink-900">
                      {b.category.name} {b.isUrgent && <Badge variant="soon">Urgent</Badge>}
                    </p>
                    <p className="text-sm text-ink-500">
                      {b.location.city} · {new Date(b.requestedFor).toLocaleString()} · ₹
                      {b.agreedWage.amount.toLocaleString("en-IN")}
                    </p>
                    {b.respondBy && (
                      <p className="mt-1 text-xs text-danger">
                        Respond by {new Date(b.respondBy).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => respondMutation.mutate({ id: b._id, action: "ACCEPT" })}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondMutation.mutate({ id: b._id, action: "DECLINE" })}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-ink-400">No pending requests right now.</p>
          )}
        </div>
      </div>

      {/* Active jobs in progress */}
      {activeBookings.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display font-semibold text-ink-900">Active Jobs</h2>
          <div className="mt-3 space-y-3">
            {activeBookings.map((b) => (
              <Link key={b._id} to={`/worker/bookings/${b._id}`}>
                <Card hoverable>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-ink-900">{b.category.name}</p>
                      <p className="text-sm text-ink-500">{b.location.city}</p>
                    </div>
                    <Badge variant="verified">{b.status}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-xs text-ink-500">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-ink-900">{value}</p>
    </Card>
  );
}