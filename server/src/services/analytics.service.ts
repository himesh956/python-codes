import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { CandidateProfile } from "../models/CandidateProfile";

type RangeDays = 7 | 30 | 90;

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Chart 1 — Applications Over Time. Groups applications by calendar
 * day within the requested window using $dateToString so the frontend
 * gets ready-to-plot { date, count } points without doing any date
 * math itself.
 */
async function getApplicationsOverTime(range: RangeDays = 30) {
  return Application.aggregate([
    { $match: { createdAt: { $gte: daysAgo(range) } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", count: 1 } },
  ]);
}

/**
 * Chart 2 — Top Skills in Demand. Unwinds jobs.skills and counts
 * occurrences across all jobs so demand signal includes jobs still
 * in the pipeline, not only published ones.
 */
async function getTopSkills(limit = 10) {
  return Job.aggregate([
    { $unwind: "$skills" },
    { $group: { _id: "$skills", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { _id: 0, skill: "$_id", count: 1 } },
  ]);
}

/**
 * Chart 3 — Average CTC by Role. "Role" is approximated by job title
 * since there's no separate normalized role field.
 */
async function getAverageCTCByRole() {
  return Job.aggregate([
    { $match: { salaryMin: { $ne: null }, salaryMax: { $ne: null } } },
    {
      $project: {
        title: 1,
        avgSalary: { $avg: ["$salaryMin", "$salaryMax"] },
      },
    },
    {
      $group: {
        _id: "$title",
        avgCTC: { $avg: "$avgSalary" },
        jobCount: { $sum: 1 },
      },
    },
    { $sort: { avgCTC: -1 } },
    { $limit: 15 },
    { $project: { _id: 0, role: "$_id", avgCTC: { $round: ["$avgCTC", 0] }, jobCount: 1 } },
  ]);
}

/** Chart 4 — Average CTC by Location. Same shape, grouped by city. */
async function getAverageCTCByLocation() {
  return Job.aggregate([
    { $match: { salaryMin: { $ne: null }, salaryMax: { $ne: null } } },
    {
      $project: {
        city: "$location.city",
        avgSalary: { $avg: ["$salaryMin", "$salaryMax"] },
      },
    },
    {
      $group: {
        _id: "$city",
        avgCTC: { $avg: "$avgSalary" },
        jobCount: { $sum: 1 },
      },
    },
    { $sort: { avgCTC: -1 } },
    { $project: { _id: 0, location: "$_id", avgCTC: { $round: ["$avgCTC", 0] }, jobCount: 1 } },
  ]);
}

/**
 * Chart 5 — Application Funnel. Counts applications that have EVER
 * reached each stage (via statusHistory), not just the current status
 * — so a candidate now REJECTED after being SHORTLISTED still counts
 * toward "Shortlisted". That is what makes it a funnel.
 */
async function getApplicationFunnel() {
  const stages = ["APPLIED", "SHORTLISTED", "INTERVIEW", "OFFERED"] as const;
  const results = await Promise.all(
    stages.map((stage) => Application.countDocuments({ "statusHistory.status": stage }))
  );
  return stages.map((stage, i) => ({ stage, count: results[i] }));
}

/** Chart 6 — Job Type Distribution. */
async function getJobTypeDistribution() {
  return Job.aggregate([
    { $group: { _id: "$employmentType", count: { $sum: 1 } } },
    { $project: { _id: 0, employmentType: "$_id", count: 1 } },
  ]);
}

/** Chart 7 — Work Mode Distribution. */
async function getWorkModeDistribution() {
  return Job.aggregate([
    { $group: { _id: "$workMode", count: { $sum: 1 } } },
    { $project: { _id: 0, workMode: "$_id", count: 1 } },
  ]);
}

/**
 * Chart 8 — Hiring Trends. Applications vs Offers per month over the
 * last 12 months. Two parallel group-by-month pipelines, merged in
 * application code — simpler than a single $facet for this volume.
 */
async function getHiringTrends() {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const [applicationsByMonth, offersByMonth] = await Promise.all([
    Application.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    Application.aggregate([
      { $match: { status: "OFFERED", createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const monthMap = new Map<string, { month: string; applications: number; offers: number }>();
  for (const row of applicationsByMonth) {
    monthMap.set(row._id, { month: row._id, applications: row.count, offers: 0 });
  }
  for (const row of offersByMonth) {
    const existing = monthMap.get(row._id);
    if (existing) existing.offers = row.count;
    else monthMap.set(row._id, { month: row._id, applications: 0, offers: row.count });
  }

  return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
}

/** Chart 9 — Location-wise Jobs. */
async function getLocationWiseJobs() {
  return Job.aggregate([
    { $group: { _id: "$location.city", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, city: "$_id", count: 1 } },
  ]);
}

/** Chart 10 — Candidate Skill Distribution. */
async function getCandidateSkillDistribution(limit = 15) {
  return CandidateProfile.aggregate([
    { $unwind: "$skills" },
    { $group: { _id: "$skills", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { _id: 0, skill: "$_id", count: 1 } },
  ]);
}

/**
 * Combined summary cards for the admin dashboard header — single
 * numbers rather than chart series, calculated here for one round trip.
 */
async function getSummaryCards() {
  const [totalApplications, totalInterviews, totalOffers, avgCTCResult] = await Promise.all([
    Application.countDocuments({}),
    Application.countDocuments({ "statusHistory.status": "INTERVIEW" }),
    Application.countDocuments({ status: "OFFERED" }),
    Job.aggregate([
      { $match: { salaryMin: { $ne: null }, salaryMax: { $ne: null } } },
      { $project: { avgSalary: { $avg: ["$salaryMin", "$salaryMax"] } } },
      { $group: { _id: null, avgCTC: { $avg: "$avgSalary" } } },
    ]),
  ]);

  const placementRate =
    totalApplications > 0 ? Math.round((totalOffers / totalApplications) * 1000) / 10 : 0;

  return {
    totalApplications,
    totalInterviews,
    totalOffers,
    averageCTC: avgCTCResult[0] ? Math.round(avgCTCResult[0].avgCTC) : 0,
    placementRatePercent: placementRate,
  };
}

export const analyticsService = {
  getApplicationsOverTime,
  getTopSkills,
  getAverageCTCByRole,
  getAverageCTCByLocation,
  getApplicationFunnel,
  getJobTypeDistribution,
  getWorkModeDistribution,
  getHiringTrends,
  getLocationWiseJobs,
  getCandidateSkillDistribution,
  getSummaryCards,
};