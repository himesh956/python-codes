import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface DisputeItem {
  _id: string;
  booking: { _id: string; category?: { name: string } };
  raisedBy: { email: string; role: string };
  reason: string;
  status: string;
  createdAt: string;
}

async function fetchDisputes(): Promise<DisputeItem[]> {
  const res = await api.get("/disputes/admin");
  return res.data.data.disputes;
}

async function resolveDispute(id: string, adminResolution: string) {
  const res = await api.patch(`/disputes/admin/${id}/resolve`, { adminResolution });
  return res.data.data.dispute;
}

export default function DisputesPage() {
  const queryClient = useQueryClient();
  const [resolutionText, setResolutionText] = useState<Record<string, string>>({});

  const { data: disputes, isLoading } = useQuery({ queryKey: ["admin-disputes"], queryFn: fetchDisputes });

  const resolveMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => resolveDispute(id, text),
    onSuccess: () => {
      toast.success("Dispute resolved");
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
    },
  });

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-900">Disputes</h1>

      <div className="mt-4 space-y-3">
        {disputes && disputes.length > 0 ? (
          disputes.map((d) => (
            <Card key={d._id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-900">
                    {d.booking?.category?.name ?? "Booking"} — filed by {d.raisedBy.email}
                  </p>
                  <p className="mt-1 text-sm text-ink-600">{d.reason}</p>
                </div>
                <Badge variant={d.status === "RESOLVED" ? "available" : "soon"}>{d.status}</Badge>
              </div>

              {d.status !== "RESOLVED" && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={resolutionText[d._id] ?? ""}
                    onChange={(e) => setResolutionText((prev) => ({ ...prev, [d._id]: e.target.value }))}
                    placeholder="Resolution notes…"
                    className="flex-1 rounded-lg border border-ink-200 px-3 py-1.5 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() =>
                      resolveMutation.mutate({ id: d._id, text: resolutionText[d._id] ?? "" })
                    }
                    disabled={!resolutionText[d._id] || resolutionText[d._id].length < 5}
                  >
                    Resolve
                  </Button>
                </div>
              )}
            </Card>
          ))
        ) : (
          <EmptyState title="No disputes" description="All bookings are running smoothly." />
        )}
      </div>
    </div>
  );
}