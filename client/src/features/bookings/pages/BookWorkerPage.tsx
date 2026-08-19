import { useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";
import { getWorkerById, getWageEstimate } from "@/features/workers/api/workers.api";
import { createBooking } from "../api/bookings.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";

export default function BookWorkerPage() {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();

  const { data: worker, isLoading, isError } = useQuery({
    queryKey: ["worker", workerId],
    queryFn: () => getWorkerById(workerId!),
    enabled: Boolean(workerId),
    retry: 1,
  });

  const [isUrgent, setIsUrgent] = useState(false);
  const [requestedFor, setRequestedFor] = useState("");
  const [wageAmount, setWageAmount] = useState("");
  const [addressNote, setAddressNote] = useState("");

  const { data: wageEstimate } = useQuery({
    queryKey: ["wage-estimate", worker?.categories[0]?._id, worker?.baseLocation.city],
    queryFn: () =>
      getWageEstimate({
        categoryId: worker!.categories[0]._id,
        city: worker!.baseLocation.city,
        experienceYears: worker!.experienceYears,
      }),
    enabled: Boolean(worker),
  });

  const bookMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (booking) => {
      toast.success("Booking request sent!");
      navigate(`/customer/bookings/${booking._id}`);
    },
    onError: (err) => toast.error(getFriendlyErrorMessage(err)),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!worker) return;
    bookMutation.mutate({
      workerId: worker._id,
      categoryId: worker.categories[0]._id,
      isUrgent,
      requestedFor: isUrgent ? new Date().toISOString() : requestedFor,
      agreedWage: { type: worker.wageExpectation.type, amount: Number(wageAmount) },
      location: { city: worker.baseLocation.city, addressNote: addressNote || undefined },
    });
  }

  if (isLoading) return <Skeleton className="h-96" />;

  if (isError || !worker) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="font-medium text-ink-800">We couldn't find this worker.</p>
        <p className="mt-1 text-sm text-ink-500">They may no longer be available.</p>
        <Button className="mt-4" onClick={() => navigate("/customer/workers")}>
          Back to Search
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-xl font-bold text-ink-900">Book {worker.fullName}</h1>

      {wageEstimate && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-trust-50 p-3 text-sm text-trust-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>
            Typical range in {worker.baseLocation.city}: ₹{wageEstimate.p25.toLocaleString("en-IN")}–₹
            {wageEstimate.p75.toLocaleString("en-IN")}
            {wageEstimate.confidence === "LOW" && " (limited local data)"}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-ink-100 bg-white p-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="h-4 w-4 rounded border-ink-300 text-brand-600"
            />
            Need this urgently (within a couple of hours)
          </label>
        </div>

        {!isUrgent && (
          <div>
            <label className="block text-sm font-medium text-ink-700">When do you need this?</label>
            <input
              type="datetime-local"
              required={!isUrgent}
              value={requestedFor}
              onChange={(e) => setRequestedFor(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink-700">
            Agreed wage (₹{worker.wageExpectation.type === "DAILY" ? "/day" : worker.wageExpectation.type === "HOURLY" ? "/hr" : "/job"})
          </label>
          <input
            type="number"
            required
            defaultValue={worker.wageExpectation.amount}
            onChange={(e) => setWageAmount(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700">Address / notes (optional)</label>
          <textarea
            rows={2}
            value={addressNote}
            onChange={(e) => setAddressNote(e.target.value)}
            placeholder="e.g. Flat 302, near XYZ market"
            className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm"
          />
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={bookMutation.isPending}>
          Send Booking Request
        </Button>
      </form>
    </div>
  );
}