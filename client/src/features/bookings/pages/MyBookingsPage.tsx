import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getMyBookingsAsCustomer, updateBookingStatus } from "../api/bookings.api";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useState } from "react";

const STATUS_VARIANT: Record<string, "verified" | "available" | "busy" | "neutral" | "soon"> = {
  REQUESTED: "neutral",
  ACCEPTED: "verified",
  IN_PROGRESS: "soon",
  COMPLETED: "available",
  DECLINED: "busy",
  CANCELLED: "busy",
  DISPUTED: "busy",
};

interface Suggestion {
  suggestedWorkerId: string;
  suggestedWorkerName: string;
}

export default function MyBookingsPage() {
  const queryClient = useQueryClient();
  const [suggestions, setSuggestions] = useState<Record<string, Suggestion | null>>({});

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings-customer"],
    queryFn: getMyBookingsAsCustomer,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateBookingStatus(id, "CANCELLED", "customer"),
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["my-bookings-customer"] });
    },
  });

  async function loadSuggestion(bookingId: string) {
    try {
      const res = await api.get(`/bookings/${bookingId}/suggest-next`);
      setSuggestions((prev) => ({ ...prev, [bookingId]: res.data.data.suggestion }));
    } catch {
      setSuggestions((prev) => ({ ...prev, [bookingId]: null }));
    }
  }

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-900">My Bookings</h1>

      <div className="mt-4 space-y-3">
        {bookings && bookings.length > 0 ? (
          bookings.map((b) => (
            <Card key={b._id}>
              <div className="flex items-center justify-between">
                <div>
                  <Link to={`/customer/bookings/${b._id}`} className="font-medium text-ink-900 hover:text-brand-700">
                    {b.category.name} — {b.worker.fullName}
                  </Link>
                  <p className="text-sm text-ink-500">
                    {b.location.city} · {new Date(b.requestedFor).toLocaleString()}
                    {b.isRepeatBooking && " · Repeat booking"}
                  </p>
                  {b.status === "REQUESTED" && b.isUrgent && b.respondBy && (
                    <div className="mt-1">
                      <CountdownTimer
                        deadline={b.respondBy}
                        onExpire={() => queryClient.invalidateQueries({ queryKey: ["my-bookings-customer"] })}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[b.status] ?? "neutral"}>{b.status}</Badge>
                  {["REQUESTED", "ACCEPTED"].includes(b.status) && (
                    <Button variant="ghost" size="sm" onClick={() => cancelMutation.mutate(b._id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {b.status === "DECLINED" && b.isUrgent && (
                <div className="mt-3 border-t border-ink-100 pt-3">
                  {suggestions[b._id] === undefined ? (
                    <button
                      onClick={() => loadSuggestion(b._id)}
                      className="text-sm text-brand-600 hover:underline"
                    >
                      Find another available worker →
                    </button>
                  ) : suggestions[b._id] ? (
                    <div className="flex items-center justify-between rounded-lg bg-trust-50 p-2.5">
                      <span className="text-sm text-trust-800">
                        {suggestions[b._id]!.suggestedWorkerName} is available now
                      </span>
                      <Link to={`/customer/book/${suggestions[b._id]!.suggestedWorkerId}`}>
                        <Button size="sm">Book Them</Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-400">No other worker available right now nearby.</p>
                  )}
                </div>
              )}
            </Card>
          ))
        ) : (
          <EmptyState title="No bookings yet" description="Book a local worker to get started." />
        )}
      </div>
    </div>
  );
}