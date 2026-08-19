import { Booking, IBooking } from "../models/Booking";
import { WorkerProfile } from "../models/WorkerProfile";
import { WorkerCategory } from "../models/WorkerCategory";
import { BulkBookingRequest } from "../models/BulkBookingRequest";
import { AppError } from "../utils/AppError";
import { notificationService } from "./notification.service";
import { trustScoreService } from "./trustScore.service";
import { bulkBookingService } from "./bulkBooking.service";
import { CreateBookingInput } from "../validators/booking.validators";
import { BookingStatus } from "../constants/workerEnums";

const URGENT_RESPOND_WINDOW_MS = 10 * 60 * 1000;

const CUSTOMER_ALLOWED: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: ["CANCELLED"],
  ACCEPTED: ["CANCELLED"],
  IN_PROGRESS: [],
  COMPLETED: ["DISPUTED"],
  DECLINED: [],
  CANCELLED: [],
  DISPUTED: [],
};

const WORKER_ALLOWED: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: ["ACCEPTED", "DECLINED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: ["DISPUTED"],
  DECLINED: [],
  CANCELLED: [],
  DISPUTED: [],
};

async function create(customerUserId: string, input: CreateBookingInput): Promise<IBooking> {
  const worker = await WorkerProfile.findById(input.workerId);
  if (!worker) throw AppError.notFound("Worker not found");

  const category = await WorkerCategory.findById(input.categoryId);
  if (!category) throw AppError.notFound("Category not found");

  if (!worker.categories.some((c) => c.toString() === input.categoryId)) {
    throw AppError.badRequest("This worker does not offer the selected category");
  }

  const priorCompleted = await Booking.findOne({
    customer: customerUserId,
    worker: worker._id,
    status: "COMPLETED",
  });

  const respondBy = input.isUrgent ? new Date(Date.now() + URGENT_RESPOND_WINDOW_MS) : undefined;

  const booking = await Booking.create({
    customer: customerUserId,
    worker: worker._id,
    category: category._id,
    isUrgent: input.isUrgent,
    requestedFor: input.requestedFor,
    respondBy,
    status: "REQUESTED",
    statusHistory: [{ status: "REQUESTED", changedAt: new Date() }],
    agreedWage: { ...input.agreedWage, currency: "INR" },
    location: input.location,
    isRepeatBooking: Boolean(priorCompleted),
  });

  await notificationService.create({
    recipient: worker.user,
    type: "NEW_APPLICATION",
    message: `New booking request${input.isUrgent ? " (URGENT)" : ""} for ${category.name}`,
    relatedEntity: { kind: "APPLICATION", id: booking._id },
  });

  return booking;
}

async function respond(
  workerUserId: string,
  bookingId: string,
  action: "ACCEPT" | "DECLINE"
): Promise<IBooking> {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw AppError.notFound("Booking not found");

  const worker = await WorkerProfile.findById(booking.worker);
  if (!worker || worker.user.toString() !== workerUserId) {
    throw AppError.forbidden("You do not have permission to respond to this booking");
  }

  if (booking.status !== "REQUESTED") {
    throw AppError.badRequest(`Cannot respond — booking is already ${booking.status}`);
  }

  if (booking.respondBy && new Date() > booking.respondBy) {
    throw AppError.badRequest("The response window for this urgent request has expired");
  }

  const newStatus: BookingStatus = action === "ACCEPT" ? "ACCEPTED" : "DECLINED";
  booking.status = newStatus;
  booking.statusHistory.push({ status: newStatus, changedAt: new Date() });
  await booking.save();

  await notificationService.create({
    recipient: booking.customer,
    type: newStatus === "ACCEPTED" ? "APPLICATION_SHORTLISTED" : "APPLICATION_REJECTED",
    message: `Your booking request was ${newStatus.toLowerCase()}`,
    relatedEntity: { kind: "APPLICATION", id: booking._id },
  });

  await trustScoreService.recompute(worker._id.toString());

  // If this booking belongs to a bulk request, keep the fill count in
  // sync. A booking can only belong to one bulk request at a time —
  // cheap lookup, no index concerns at expected volume.
  const parentBulkRequest = await BulkBookingRequest.findOne({ filledByBookings: booking._id });
  if (parentBulkRequest) {
    await bulkBookingService.recomputeFillStatus(parentBulkRequest._id.toString());
  }

  return booking;
}

async function updateStatus(
  userId: string,
  role: "CUSTOMER" | "WORKER",
  bookingId: string,
  newStatus: BookingStatus
): Promise<IBooking> {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw AppError.notFound("Booking not found");

  if (role === "CUSTOMER") {
    if (booking.customer.toString() !== userId) {
      throw AppError.forbidden("You do not have permission to update this booking");
    }
    if (!CUSTOMER_ALLOWED[booking.status].includes(newStatus)) {
      throw AppError.badRequest(`Cannot move booking from ${booking.status} to ${newStatus}`);
    }
  } else {
    const worker = await WorkerProfile.findById(booking.worker);
    if (!worker || worker.user.toString() !== userId) {
      throw AppError.forbidden("You do not have permission to update this booking");
    }
    if (!WORKER_ALLOWED[booking.status].includes(newStatus)) {
      throw AppError.badRequest(`Cannot move booking from ${booking.status} to ${newStatus}`);
    }
  }

  booking.status = newStatus;
  booking.statusHistory.push({ status: newStatus, changedAt: new Date() });
  await booking.save();

  if (newStatus === "COMPLETED") {
    await WorkerProfile.findByIdAndUpdate(booking.worker, {
      $inc: { completedJobsCount: 1 },
      $set: { isNewWorker: false },
    });
    await trustScoreService.recompute(booking.worker.toString());
  }

  if (newStatus === "CANCELLED" && role === "WORKER") {
    await trustScoreService.recompute(booking.worker.toString());
  }

  return booking;
}

async function getMyBookingsAsCustomer(userId: string): Promise<IBooking[]> {
  return Booking.find({ customer: userId })
    .sort({ createdAt: -1 })
    .populate("worker", "fullName photoUrl trustScore averageRating")
    .populate("category", "name icon");
}

async function getMyBookingsAsWorker(userId: string): Promise<IBooking[]> {
  const worker = await WorkerProfile.findOne({ user: userId });
  if (!worker) throw AppError.notFound("Worker profile not found");

  return Booking.find({ worker: worker._id })
    .sort({ createdAt: -1 })
    .populate("category", "name icon");
}

async function getById(userId: string, bookingId: string): Promise<IBooking> {
  const booking = await Booking.findById(bookingId)
    .populate("worker", "fullName photoUrl trustScore averageRating")
    .populate("category", "name icon");
  if (!booking) throw AppError.notFound("Booking not found");

  const worker = await WorkerProfile.findById(booking.worker);
  const isCustomer = booking.customer.toString() === userId;
  const isWorkerOwner = worker && worker.user.toString() === userId;

  if (!isCustomer && !isWorkerOwner) {
    throw AppError.forbidden("You do not have access to this booking");
  }

  return booking;
}

export const bookingService = {
  create,
  respond,
  updateStatus,
  getMyBookingsAsCustomer,
  getMyBookingsAsWorker,
  getById,
};