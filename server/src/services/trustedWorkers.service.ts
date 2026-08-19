import { Booking } from "../models/Booking";
import { WorkerProfile } from "../models/WorkerProfile";
import mongoose from "mongoose";

/**
 * "My Trusted Workers" (Part 10 of the product plan) — auto-derived
 * from completed bookings, not a separate favorites collection at
 * MVP. A customer's trusted list is simply "everyone I've completed
 * a job with," ranked by most recent. Manual favoriting (without a
 * completed job) is a cheap V1 addition if usage shows people want it
 * before actually booking — deferred for now per YAGNI.
 */
async function getTrustedWorkersForCustomer(customerUserId: string) {
  const completedBookings = await Booking.aggregate([
    {
      $match: {
        customer: new mongoose.Types.ObjectId(customerUserId),
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: "$worker",
        jobsCompletedWithThisWorker: { $sum: 1 },
        lastBookingAt: { $max: "$createdAt" },
      },
    },
    { $sort: { lastBookingAt: -1 } },
  ]);

  const workerIds = completedBookings.map((b) => b._id);
  const workers = await WorkerProfile.find({ _id: { $in: workerIds } }).populate(
    "categories",
    "name icon"
  );

  // Merge the per-customer completion count back onto each worker doc.
  const countMap = new Map(completedBookings.map((b) => [b._id.toString(), b.jobsCompletedWithThisWorker]));

  return workers
    .map((w) => ({
      worker: w,
      jobsCompletedWithThisWorker: countMap.get(w._id.toString()) ?? 0,
    }))
    .sort((a, b) => b.jobsCompletedWithThisWorker - a.jobsCompletedWithThisWorker);
}

export const trustedWorkersService = { getTrustedWorkersForCustomer };