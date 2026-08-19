import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface ReportItem {
  _id: string;
  reportedBy: { email: string };
  targetType: string;
  targetId: string;
  reason: string;
  details?: string;
  status: string;
  createdAt: string;
}

async function fetchReports(status?: string): Promise<ReportItem[]> {
  const res = await api.get("/trust-safety/reports/admin", { params: status ? { status } : {} });
  return res.data.data.reports;
}

async function resolveReport(id: string, status: "REVIEWED" | "DISMISSED") {
  const res = await api.patch(`/trust-safety/reports/admin/${id}/resolve`, { status });
  return res.data.data.report;
}

export default function ReportsPage() {
  const [filter, setFilter] = useState<string>("OPEN");
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports", filter],
    queryFn: () => fetchReports(filter || undefined),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "REVIEWED" | "DISMISSED" }) =>
      resolveReport(id, status),
    onSuccess: () => {
      toast.success("Report updated");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink-900">Reports</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-ink-200 px-3 py-2 text-sm"
        >
          <option value="OPEN">Open</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="DISMISSED">Dismissed</option>
          <option value="">All</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <Skeleton className="h-40" />
        ) : reports && reports.length > 0 ? (
          reports.map((r) => (
            <Card key={r._id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-ink-900">
                    {r.reason.replace(/_/g, " ")} — {r.targetType}
                  </p>
                  <p className="text-xs text-ink-500">Reported by {r.reportedBy.email}</p>
                  {r.details && <p className="mt-1 text-sm text-ink-600">{r.details}</p>}
                </div>
                <Badge variant={r.status === "OPEN" ? "soon" : r.status === "REVIEWED" ? "available" : "neutral"}>
                  {r.status}
                </Badge>
              </div>

              {r.status === "OPEN" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => resolveMutation.mutate({ id: r._id, status: "REVIEWED" })}>
                    Mark Reviewed
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => resolveMutation.mutate({ id: r._id, status: "DISMISSED" })}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </Card>
          ))
        ) : (
          <EmptyState title="No reports" description="Nothing needs your attention right now." />
        )}
      </div>
    </div>
  );
}