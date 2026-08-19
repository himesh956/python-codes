import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  getTopSkills,
  getAverageCTCByRole,
  getAverageCTCByLocation,
  getHiringTrends,
  getLocationWiseJobs,
  getCandidateSkillDistribution,
} from "../api/admin.api";
import { ChartCard } from "@/components/ChartCard";

function ChartSkeleton() {
  return <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />;
}

export default function AdminAnalyticsPage() {
  const topSkills = useQuery({ queryKey: ["top-skills"], queryFn: getTopSkills });
  const ctcByRole = useQuery({ queryKey: ["ctc-by-role"], queryFn: getAverageCTCByRole });
  const ctcByLocation = useQuery({ queryKey: ["ctc-by-location"], queryFn: getAverageCTCByLocation });
  const hiringTrends = useQuery({ queryKey: ["hiring-trends"], queryFn: getHiringTrends });
  const locationJobs = useQuery({ queryKey: ["location-jobs"], queryFn: getLocationWiseJobs });
  const candidateSkills = useQuery({
    queryKey: ["candidate-skills"],
    queryFn: getCandidateSkillDistribution,
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Placement Analytics</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Top Skills in Demand">
          {topSkills.isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkills.data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="skill" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Candidate Skill Distribution">
          {candidateSkills.isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candidateSkills.data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="skill" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Average CTC by Role">
          {ctcByRole.isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ctcByRole.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="role" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => `₹${(v / 100000).toFixed(1)}L`} />
                <Bar dataKey="avgCTC" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Average CTC by Location">
          {ctcByLocation.isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ctcByLocation.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="location" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => `₹${(v / 100000).toFixed(1)}L`} />
                <Bar dataKey="avgCTC" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Hiring Trends (Applications vs Offers)">
          {hiringTrends.isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hiringTrends.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="offers" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Location-wise Jobs">
          {locationJobs.isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationJobs.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}