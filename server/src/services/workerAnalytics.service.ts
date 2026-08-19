import { WorkerProfile } from "../models/WorkerProfile";
import { Booking } from "../models/Booking";
import { WorkerCategory } from "../models/WorkerCategory";
import { Dispute } from "../models/Dispute";

/**
 * Worker-marketplace equivalents of the existing job-portal analytics
 * (analytics.service.ts) — same aggregation-first philosophy, no
 * frontend-computed numbers. These feed new charts on the admin
 * dashboard alongside the existing 10.
 */

/** Category-wise worker demand: how many bookings requested per category, last 30 days. */
async function getCategoryDemand() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return Booking.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: "$category", requestCount: { $sum: 1 } } },
    { $lookup: { from: "workercategories", localField: "_id", foreignField: "_id", as: "category" } },
    { $unwind: "$category" },
    { $sort: { requestCount: -1 } },
    { $project: { _id: 0, category: "$category.name", requestCount: 1 } },
  ]);
}

/** Average wage by category (across all workers' stated wageExpectation, not just completed bookings — shows asking-price landscape). */
async function getAverageWageByCategory() {
  return WorkerProfile.aggregate([
    { $unwind: "$categories" },
    {
      $group: {
        _id: "$categories",
        avgWage: { $avg: "$wageExpectation.amount" },
        workerCount: { $sum: 1 },
      },
    },
    { $lookup: { from: "workercategories", localField: "_id", foreignField: "_id", as: "category" } },
    { $unwind: "$category" },
    { $sort: { avgWage: -1 } },
    { $project: { _id: 0, category: "$category.name", avgWage: { $round: ["$avgWage", 0] }, workerCount: 1 } },
  ]);
}

/** Top-rated workers leaderboard, platform-wide (min 3 completed jobs to qualify — avoids single-review flukes dominating). */
async function getTopRatedWorkers(limit = 10) {
  return WorkerProfile.find({ completedJobsCount: { $gte: 3 } })
    .sort({ trustScore: -1, averageRating: -1 })
    .limit(limit)
    .select("fullName trustScore averageRating completedJobsCount")
    .populate("categories", "name");
}

/** Booking completion rate: COMPLETED / (COMPLETED + CANCELLED + DECLINED), last 30 days. */
async function getBookingCompletionRate() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [completed, cancelled, declined, total] = await Promise.all([
    Booking.countDocuments({ status: "COMPLETED", createdAt: { $gte: thirtyDaysAgo } }),
    Booking.countDocuments({ status: "CANCELLED", createdAt: { $gte: thirtyDaysAgo } }),
    Booking.countDocuments({ status: "DECLINED", createdAt: { $gte: thirtyDaysAgo } }),
    Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  return {
    completed,
    cancelled,
    declined,
    total,
    completionRatePercent: total > 0 ? Math.round((completed / total) * 1000) / 10 : 0,
  };
}

/** Category-wise growth trend: new workers registered per category per month, last 6 months. */
async function getCategoryGrowthTrend() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return WorkerProfile.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $unwind: "$categories" },
    {
      $group: {
        _id: {
          category: "$categories",
          month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        },
        newWorkers: { $sum: 1 },
      },
    },
    { $lookup: { from: "workercategories", localField: "_id.category", foreignField: "_id", as: "cat" } },
    { $unwind: "$cat" },
    { $sort: { "_id.month": 1 } },
    { $project: { _id: 0, category: "$cat.name", month: "$_id.month", newWorkers: 1 } },
  ]);
}

/** Dispute rate: disputes / total completed+disputed bookings, last 30 days — a safety health metric per Part 19. */
async function getDisputeRate() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [disputeCount, resolvedOutcomeBookings] = await Promise.all([
    Dispute.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Booking.countDocuments({
      status: { $in: ["COMPLETED", "DISPUTED"] },
      createdAt: { $gte: thirtyDaysAgo },
    }),
  ]);

  return {
    disputeCount,
    totalRelevantBookings: resolvedOutcomeBookings,
    disputeRatePercent:
      resolvedOutcomeBookings > 0 ? Math.round((disputeCount / resolvedOutcomeBookings) * 1000) / 10 : 0,
  };
}

/** Worker retention proxy: % of workers with a completed job in the last 30 days, among those active 60+ days ago. */
async function getWorkerRetention() {
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const eligibleWorkers = await WorkerProfile.countDocuments({ createdAt: { $lte: sixtyDaysAgo } });
  const activeWorkerIds = await Booking.find({
    status: "COMPLETED",
    createdAt: { $gte: thirtyDaysAgo },
  }).distinct("worker");

  return {
    eligibleWorkers,
    activeInLast30Days: activeWorkerIds.length,
    retentionRatePercent:
      eligibleWorkers > 0 ? Math.round((activeWorkerIds.length / eligibleWorkers) * 1000) / 10 : 0,
  };
}

/** North Star metric (Part 19): completed bookings per active worker per month. */
async function getNorthStarMetric() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [completedBookings, activeWorkerCount] = await Promise.all([
    Booking.countDocuments({ status: "COMPLETED", createdAt: { $gte: thirtyDaysAgo } }),
    WorkerProfile.countDocuments({ availabilityState: { $ne: "OFFLINE" } }),
  ]);

  return {
    completedBookingsLast30Days: completedBookings,
    activeWorkers: activeWorkerCount,
    completedBookingsPerActiveWorker:
      activeWorkerCount > 0 ? Math.round((completedBookings / activeWorkerCount) * 100) / 100 : 0,
  };
}

export const workerAnalyticsService = {
  getCategoryDemand,
  getAverageWageByCategory,
  getTopRatedWorkers,
  getBookingCompletionRate,
  getCategoryGrowthTrend,
  getDisputeRate,
  getWorkerRetention,
  getNorthStarMetric,
};