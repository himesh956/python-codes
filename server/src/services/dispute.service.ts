import { Dispute, IDispute } from "../models/Dispute";
import { Booking } from "../models/Booking";
import { WorkerProfile } from "../models/WorkerProfile";
import { AppError } from "../utils/AppError";
import { trustScoreService } from "./trustScore.service";
import { DisputeCategory } from "../constants/workerEnums";

async function create(
  userId: string,
  bookingId: string,
  category: DisputeCategory,
  reason: string,
  evidenceUrls?: string[]
): Promise<IDispute> {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw AppError.notFound("Booking not found");

  const worker = await WorkerProfile.findById(booking.worker);
  const isCustomer = booking.customer.toString() === userId;
  const isWorkerOwner = worker && worker.user.toString() === userId;

  if (!isCustomer && !isWorkerOwner) {
    throw AppError.forbidden("You do not have access to this booking");
  }

  const existing = await Dispute.findOne({ booking: booking._id });
  if (existing) throw AppError.conflict("A dispute already exists for this booking");

  const dispute = await Dispute.create({
    booking: booking._id,
    raisedBy: userId,
    category,
    reason,
    evidenceUrls: evidenceUrls ?? [],
    status: "OPEN",
  });

  booking.status = "DISPUTED";
  booking.statusHistory.push({ status: "DISPUTED", changedAt: new Date() });
  await booking.save();

  if (worker) {
    await trustScoreService.recompute(worker._id.toString());
  }

  return dispute;
}

async function listForAdmin(status?: string): Promise<IDispute[]> {
  const filter = status ? { status } : {};
  return Dispute.find(filter)
    .sort({ createdAt: -1 })
    .populate("booking")
    .populate("raisedBy", "email role");
}

async function resolve(adminUserId: string, disputeId: string, adminResolution: string): Promise<IDispute> {
  const dispute = await Dispute.findById(disputeId);
  if (!dispute) throw AppError.notFound("Dispute not found");

  dispute.status = "RESOLVED";
  dispute.adminResolution = adminResolution;
  dispute.resolvedBy = adminUserId as unknown as typeof dispute.resolvedBy;
  dispute.resolvedAt = new Date();
  await dispute.save();

  const booking = await Booking.findById(dispute.booking);
  if (booking) {
    await trustScoreService.recompute(booking.worker.toString());
  }

  return dispute;
}

export const disputeService = { create, listForAdmin, resolve };