import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "@/lib/api";
import { ChartCard } from "@/components/ChartCard";
import { Card } from "@/components/ui/Card";

interface DashboardData {
  northStar: { completedBookingsLast30Days: number; activeWorkers: number; completedBookingsPerActiveWorker: number };
  completionRate: { completed: number; total: number; completionRatePercent: number };
  disputeRate: { disputeCount: number; disputeRatePercent: number };
  retention: { retentionRatePercent: number };
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await api.get("/admin/worker-analytics/dashboard");
  return res.data.data;
}

async function fetchCategoryDemand() {
  const res = await api.get("/admin/worker-analytics/category-demand");
  return res.data.data as { category: string; requestCount: number }[];
}

async function fetchWageByCategory() {
  const res = await api.get("/admin/worker-analytics/wage-by-category");
  return res.data.data as { category: string; avgWage: number; workerCount: number }[];
}

async function fetchTopRatedWorkers() {
  const res = await api.get("/admin/worker-analytics/top-rated-workers");
  return res.data.data as {
    _id: string;
    fullName: string;
    trustScore: number;
    averageRating: number;
    completedJobsCount: number;
  }[];
}

function ChartSkeleton() {
  return <div className="h-full w-full animate-pulse rounded-lg bg-ink-100" />;
}

export default function WorkerAnalyticsPage() {
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["worker-analytics-dashboard"],
    queryFn: fetchDashboard,
  });
  const { data: categoryDemand, isLoading: demandLoading } = useQuery({
    queryKey: ["category-demand"],
    queryFn: fetchCategoryDemand,
  });
  const { data: wageByCategory, isLoading: wageLoading } = useQuery({
    queryKey: ["wage-by-category"],
    queryFn: fetchWageByCategory,
  });
  const { data: topWorkers, isLoading: topWorkersLoading } = useQuery({
    queryKey: ["top-rated-workers"],
    queryFn: fetchTopRatedWorkers,
  });

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-900">Worker Marketplace Analytics</h1>

      {dashboard && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <p className="text-xs text-ink-500">North Star: Jobs/Active Worker</p>
            <p className="mt-1 font-display text-xl font-bold text-brand-700">
              {dashboard.northStar.completedBookingsPerActiveWorker}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-ink-500">Booking Completion Rate</p>
            <p className="mt-1 font-display text-xl font-bold text-ink-900">
              {dashboard.completionRate.completionRatePercent}%
            </p>
          </Card>
          <Card>
            <p className="text-xs text-ink-500">Dispute Rate</p>
            <p className="mt-1 font-display text-xl font-bold text-danger">
              {dashboard.disputeRate.disputeRatePercent}%
            </p>
          </Card>
          <Card>
            <p className="text-xs text-ink-500">Worker Retention (30d)</p>
            <p className="mt-1 font-display text-xl font-bold text-trust-700">
              {dashboard.retention.retentionRatePercent}%
            </p>
          </Card>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Category Demand (last 30 days)">
          {demandLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDemand} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e3dcd4" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="requestCount" fill="#dd5f23" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Average Wage by Category">
          {wageLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wageByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3dcd4" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Bar dataKey="avgWage" fill="#279690" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="mt-6">
        <h2 className="font-display font-semibold text-ink-900">Top Rated Workers</h2>
        <div className="mt-3 space-y-2">
          {topWorkersLoading ? (
            <div className="h-40 animate-pulse rounded-xl bg-ink-100" />
          ) : (
            topWorkers?.map((w, i) => (
              <Card key={w._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-ink-300">#{i + 1}</span>
                  <div>
                    <p className="font-medium text-ink-900">{w.fullName}</p>
                    <p className="text-xs text-ink-500">{w.completedJobsCount} jobs completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-trust-700">{w.trustScore}</p>
                  <p className="text-xs text-ink-500">{w.averageRating.toFixed(1)} ★</p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}