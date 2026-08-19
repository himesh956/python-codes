import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getPlatformOverview, getAnalyticsDashboard } from "../api/admin.api";
import { ChartCard } from "@/components/ChartCard";

const PIE_COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

function OverviewCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getPlatformOverview,
  });

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["admin-analytics-dashboard"],
    queryFn: getAnalyticsDashboard,
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Platform Dashboard</h1>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <OverviewCard label="Candidates" value={overviewLoading ? "…" : overview?.totalCandidates ?? 0} />
        <OverviewCard label="Employers" value={overviewLoading ? "…" : overview?.totalEmployers ?? 0} />
        <OverviewCard label="Active Employers" value={overviewLoading ? "…" : overview?.activeEmployers ?? 0} />
        <OverviewCard label="Total Jobs" value={overviewLoading ? "…" : overview?.totalJobs ?? 0} />
        <OverviewCard label="Active Jobs" value={overviewLoading ? "…" : overview?.activeJobs ?? 0} />
      </div>

      {dashboard && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <OverviewCard label="Applications" value={dashboard.summary.totalApplications} />
          <OverviewCard label="Interviews" value={dashboard.summary.totalInterviews} />
          <OverviewCard label="Offers" value={dashboard.summary.totalOffers} />
          <OverviewCard
            label="Avg CTC"
            value={dashboard.summary.averageCTC ? `₹${(dashboard.summary.averageCTC / 100000).toFixed(1)}L` : "-"}
          />
          <OverviewCard label="Placement Rate" value={`${dashboard.summary.placementRatePercent}%`} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Applications Over Time (30 days)">
          {dashboardLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard?.applicationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Application Funnel">
          {dashboardLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard?.funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Job Type Distribution">
          {dashboardLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboard?.jobTypeDistribution}
                  dataKey="count"
                  nameKey="employmentType"
                  outerRadius={80}
                  label
                >
                  {dashboard?.jobTypeDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Work Mode Distribution">
          {dashboardLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboard?.workModeDistribution}
                  dataKey="count"
                  nameKey="workMode"
                  outerRadius={80}
                  label
                >
                  {dashboard?.workModeDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />;
}