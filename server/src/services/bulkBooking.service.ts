import { BulkBookingRequest, IBulkBookingRequest } from "../models/BulkBookingRequest";
import { WorkerProfile } from "../models/WorkerProfile";
import { WorkerCategory } from "../models/WorkerCategory";
import { Booking } from "../models/Booking";
import { AppError } from "../utils/AppError";
import { notificationService } from "./notification.service";

interface CreateBulkRequestInput {
  categoryId: string;
  quantityNeeded: number;
  requestedFor: Date;
  agreedWage: { type: string; amount: number };
  location: { city: string; addressNote?: string };
}

/**
 * Creates the bulk request AND immediately sends individual booking
 * requests to the top N available workers in that category/city (N =
 * quantityNeeded, capped at a reasonable fan-out to avoid spamming an
 * entire city's workforce for a small request). Reuses the existing
 * Booking model/lifecycle entirely — a bulk request is really just
 * "create several bookings at once, then track how many get accepted."
 */
async function create(businessUserId: string, input: CreateBulkRequestInput): Promise<IBulkBookingRequest> {
  const category = await WorkerCategory.findById(input.categoryId);
  if (!category) throw AppError.notFound("Category not found");

  const bulkRequest = await BulkBookingRequest.create({
    business: businessUserId,
    category: category._id,
    quantityNeeded: input.quantityNeeded,
    requestedFor: input.requestedFor,
    agreedWage: { ...input.agreedWage, currency: "INR" },
    location: input.location,
    status: "OPEN",
  });

  // Fan out to available workers — cap at 2x quantity needed so not
  // every single matching worker in the city gets pinged for a request
  // of size 3, while still giving enough headroom for declines.
  const fanOutLimit = Math.min(input.quantityNeeded * 2, 30);
  const candidateWorkers = await WorkerProfile.find({
    categories: category._id,
    "baseLocation.city": input.location.city,
    availabilityState: { $in: ["AVAILABLE_NOW", "AVAILABLE_TODAY"] },
  })
    .sort({ trustScore: -1 })
    .limit(fanOutLimit);

  const createdBookings = await Promise.all(
    candidateWorkers.map((worker) =>
      Booking.create({
        customer: businessUserId,
        worker: worker._id,
        category: category._id,
        isUrgent: false,
        requestedFor: input.requestedFor,
        status: "REQUESTED",
        statusHistory: [{ status: "REQUESTED", changedAt: new Date() }],
        agreedWage: { ...input.agreedWage, currency: "INR" },
        location: input.location,
        isRepeatBooking: false,
      })
    )
  );

  bulkRequest.filledByBookings = createdBookings.map((b) => b._id);
  await bulkRequest.save();

  await Promise.all(
    candidateWorkers.map((worker) =>
      notificationService.create({
        recipient: worker.user,
        type: "NEW_APPLICATION",
        message: `New bulk hiring request for ${category.name} (${input.quantityNeeded} needed)`,
        relatedEntity: { kind: "APPLICATION", id: bulkRequest._id },
      })
    )
  );

  return bulkRequest;
}

/**
 * Recomputes fill status whenever an individual Booking tied to this
 * bulk request changes state (called from booking.service.ts on
 * accept) — keeps quantityFilled/status accurate without a separate
 * polling job.
 */
async function recomputeFillStatus(bulkRequestId: string): Promise<void> {
  const bulkRequest = await BulkBookingRequest.findById(bulkRequestId);
  if (!bulkRequest) return;

  const acceptedCount = await Booking.countDocuments({
    _id: { $in: bulkRequest.filledByBookings },
    status: { $in: ["ACCEPTED", "IN_PROGRESS", "COMPLETED"] },
  });

  bulkRequest.quantityFilled = acceptedCount;
  bulkRequest.status =
    acceptedCount >= bulkRequest.quantityNeeded
      ? "FILLED"
      : acceptedCount > 0
        ? "PARTIALLY_FILLED"
        : "OPEN";
  await bulkRequest.save();
}

async function getMyBulkRequests(businessUserId: string): Promise<IBulkBookingRequest[]> {
  return BulkBookingRequest.find({ business: businessUserId })
    .sort({ createdAt: -1 })
    .populate("category", "name icon")
    .populate({
      path: "filledByBookings",
      populate: { path: "worker", select: "fullName photoUrl trustScore" },
    });
}

export const bulkBookingService = { create, recomputeFillStatus, getMyBulkRequests };