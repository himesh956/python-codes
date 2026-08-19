import { Booking } from "../models/Booking";
import { WorkerProfile } from "../models/WorkerProfile";
import { AppError } from "../utils/AppError";
import { notificationService } from "./notification.service";

/**
 * When an urgent request is declined or times out, the customer
 * shouldn't have to manually restart search — this suggests the next
 * best available worker in the same category/city automatically
 * (Part 7 of the product plan: "customer doesn't manually retry").
 * Excludes workers already declined/timed-out for THIS specific
 * customer request so the same unavailable worker isn't re-suggested.
 */
async function suggestNextWorker(
  expiredOrDeclinedBookingId: string
): Promise<{ suggestedWorkerId: string; suggestedWorkerName: string } | null> {
  const booking = await Booking.findById(expiredOrDeclinedBookingId);
  if (!booking) throw AppError.notFound("Booking not found");

  // Find every worker this customer has already tried for this same
  // urgent need (same category + within a tight time window), so we
  // never suggest someone already declined.
  const recentAttempts = await Booking.find({
    customer: booking.customer,
    category: booking.category,
    isUrgent: true,
    createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // last 30 min = "same urgent need"
  }).distinct("worker");

  const nextWorker = await WorkerProfile.findOne({
    _id: { $nin: recentAttempts },
    categories: booking.category,
    "baseLocation.city": booking.location.city,
    availabilityState: "AVAILABLE_NOW",
  }).sort({ trustScore: -1 });

  if (!nextWorker) return null;

  return { suggestedWorkerId: nextWorker._id.toString(), suggestedWorkerName: nextWorker.fullName };
}

/**
 * Sweeps REQUESTED urgent bookings whose respondBy deadline has
 * passed, marks them DECLINED (system-timeout, not a real decline —
 * but functionally the same for ranking/reliability purposes per
 * trustScore.service.ts, which already treats DECLINED as a
 * reliability signal), and notifies the customer with a next-worker
 * suggestion. Designed to run on a short interval (see server.ts cron
 * wiring below) rather than relying on the customer polling.
 */
async function sweepExpiredUrgentRequests(): Promise<number> {
  const expired = await Booking.find({
    status: "REQUESTED",
    isUrgent: true,
    respondBy: { $lt: new Date() },
  });

  for (const booking of expired) {
    booking.status = "DECLINED";
    booking.statusHistory.push({ status: "DECLINED", changedAt: new Date(), note: "Auto-expired: no response in time" });
    await booking.save();

    const suggestion = await suggestNextWorker(booking._id.toString());

    await notificationService.create({
      recipient: booking.customer,
      type: "APPLICATION_REJECTED",
      message: suggestion
        ? `Your urgent request timed out. We found another available worker: ${suggestion.suggestedWorkerName}`
        : "Your urgent request timed out and no other worker is available right now nearby.",
      relatedEntity: { kind: "APPLICATION", id: booking._id },
    });
  }

  return expired.length;
}

export const urgentBookingService = { suggestNextWorker, sweepExpiredUrgentRequests };