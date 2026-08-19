import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { Booking } from "../types";
import { updateBookingStatus } from "../api/bookings.api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ChatButton } from "@/components/ChatButton";
import { CallButton } from "@/components/CallButton";
import { useAuth } from "@/features/auth/context/AuthContext";

const WORKER_RATING_TAGS = [
  "Paid on time",
  "Good communication",
  "Professional",
  "Safe workplace",
  "Clear work requirements",
];

const DISPUTE_CATEGORIES = [
  { value: "PAYMENT_ISSUE", label: "Payment issue" },
  { value: "FAKE_JOB", label: "Fake job" },
  { value: "ABUSIVE_BEHAVIOR", label: "Abusive behavior" },
  { value: "NO_SHOW", label: "No-show" },
  { value: "WRONG_WORK_DESCRIPTION", label: "Wrong work description" },
  { value: "OTHER", label: "Other" },
];

async function fetchBooking(id: string): Promise<Booking> {
  const res = await api.get(`/bookings/${id}`);
  return res.data.data.booking;
}

async function submitReviewWithTags(payload: {
  bookingId: string;
  reviewerRole: "CUSTOMER";
  rating: number;
  comment?: string;
  tags: string[];
}) {
  const res = await api.post("/reviews", payload);
  return res.data.data.review;
}

async function fileDispute(payload: { bookingId: string; category: string; reason: string }) {
  const res = await api.post("/disputes", payload);
  return res.data.data.dispute;
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState("OTHER");
  const [disputeReason, setDisputeReason] = useState("");

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => fetchBooking(id!),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, as }: { status: string; as: "customer" | "worker" }) =>
      updateBookingStatus(id!, status, as),
    onSuccess: () => {
      toast.success("Booking updated");
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
    },
    onError: () => toast.error("Could not update booking"),
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      submitReviewWithTags({
        bookingId: id!,
        reviewerRole: "CUSTOMER",
        rating,
        comment: comment || undefined,
        tags: selectedTags,
      }),
    onSuccess: () => {
      toast.success("Thanks for your review!");
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
    },
    onError: () => toast.error("Could not submit review"),
  });

  const disputeMutation = useMutation({
    mutationFn: () => fileDispute({ bookingId: id!, category: disputeCategory, reason: disputeReason }),
    onSuccess: () => {
      toast.success("Dispute filed — an admin will review it");
      setShowDisputeForm(false);
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
    },
    onError: () => toast.error("Could not file dispute"),
  });

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  if (isLoading) return <Skeleton className="h-64" />;
  if (!booking) return <p className="text-sm text-ink-500">Booking not found.</p>;

  const canDispute = ["COMPLETED", "IN_PROGRESS"].includes(booking.status);
  const otherUserId = booking.customer === user?.id ? booking.worker._id : booking.customer;

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-bold text-ink-900">{booking.category.name}</p>
            <p className="text-sm text-ink-500">with {booking.worker.fullName}</p>
          </div>
          <Badge variant="neutral">{booking.status}</Badge>
        </div>

        <div className="mt-4 space-y-1 text-sm text-ink-600">
          <p>📍 {booking.location.city}{booking.location.addressNote ? ` — ${booking.location.addressNote}` : ""}</p>
          <p>🕐 {new Date(booking.requestedFor).toLocaleString()}</p>
          <p>
            💰 ₹{booking.agreedWage.amount.toLocaleString("en-IN")} ({booking.agreedWage.type.toLowerCase()})
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <ChatButton otherUserId={otherUserId} contextType="BOOKING" contextId={booking._id} />
          <CallButton receiverId={otherUserId} contextType="BOOKING" contextId={booking._id} />
        </div>

        {booking.status === "COMPLETED" && (
          <div className="mt-6 border-t border-ink-100 pt-4">
            <p className="font-medium text-ink-800">Rate this worker</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`text-2xl ${n <= rating ? "text-amber-500" : "text-ink-200"}`}
                >
                  ★
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {WORKER_RATING_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    selectedTags.includes(tag)
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-ink-200 text-ink-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment"
              className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
            />
            <Button className="mt-2" onClick={() => reviewMutation.mutate()} isLoading={reviewMutation.isPending}>
              Submit Review
            </Button>
          </div>
        )}

        {booking.status === "ACCEPTED" && (
          <Button className="mt-4" fullWidth onClick={() => statusMutation.mutate({ status: "IN_PROGRESS", as: "worker" })}>
            Mark as Started
          </Button>
        )}
        {booking.status === "IN_PROGRESS" && (
          <Button className="mt-4" fullWidth onClick={() => statusMutation.mutate({ status: "COMPLETED", as: "worker" })}>
            Mark as Completed
          </Button>
        )}

        {canDispute && (
          <div className="mt-4 border-t border-ink-100 pt-4">
            {!showDisputeForm ? (
              <button
                onClick={() => setShowDisputeForm(true)}
                className="flex items-center gap-1.5 text-sm text-danger hover:underline"
              >
                <AlertTriangle size={14} /> Report an issue with this booking
              </button>
            ) : (
              <div>
                <select
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                >
                  {DISPUTE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <textarea
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe what went wrong…"
                  className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => disputeMutation.mutate()}
                    isLoading={disputeMutation.isPending}
                    disabled={disputeReason.length < 10}
                  >
                    File Dispute
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowDisputeForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}