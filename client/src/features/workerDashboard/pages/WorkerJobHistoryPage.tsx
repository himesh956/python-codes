import { useQuery } from "@tanstack/react-query";
import { getMyBookingsAsWorker } from "@/features/bookings/api/bookings.api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function WorkerJobHistoryPage() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings-worker"],
    queryFn: getMyBookingsAsWorker,
  });

  const completed = bookings?.filter((b) => b.status === "COMPLETED") ?? [];
  const totalEarned = completed.reduce((sum, b) => sum + b.agreedWage.amount, 0);

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-900">Job History</h1>

      <Card className="mt-4 bg-brand-50">
        <p className="text-sm text-brand-700">Total earned (completed jobs)</p>
        <p className="mt-1 font-display text-2xl font-bold text-brand-800">
          ₹{totalEarned.toLocaleString("en-IN")}
        </p>
      </Card>

      <div className="mt-4 space-y-3">
        {completed.length > 0 ? (
          completed.map((b) => (
            <Card key={b._id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-900">{b.category.name}</p>
                  <p className="text-sm text-ink-500">
                    {b.location.city} · {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="available">Completed</Badge>
                  <p className="mt-1 text-sm font-semibold text-ink-800">
                    ₹{b.agreedWage.amount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState title="No completed jobs yet" description="Accept a booking request to get started." />
        )}
      </div>
    </div>
  );
}