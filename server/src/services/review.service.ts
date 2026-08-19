import { Review, IReview } from "../models/Review";
import { Booking } from "../models/Booking";
import { WorkerProfile } from "../models/WorkerProfile";
import { AppError } from "../utils/AppError";
import { trustScoreService } from "./trustScore.service";
import { CreateReviewInput } from "../validators/review.validators";

async function submit(userId: string, input: CreateReviewInput): Promise<IReview> {
  const booking = await Booking.findById(input.bookingId);
  if (!booking) throw AppError.notFound("Booking not found");

  if (booking.status !== "COMPLETED") {
    throw AppError.badRequest("Reviews can only be submitted for completed bookings");
  }

  const worker = await WorkerProfile.findById(booking.worker);
  if (!worker) throw AppError.notFound("Worker not found");

  const isCustomer = booking.customer.toString() === userId;
  const isWorkerOwner = worker.user.toString() === userId;

  if (input.reviewerRole === "CUSTOMER" && !isCustomer) {
    throw AppError.forbidden("Only the customer on this booking can leave this review");
  }
  if (input.reviewerRole === "WORKER" && !isWorkerOwner) {
    throw AppError.forbidden("Only the worker on this booking can leave this review");
  }

  const existing = await Review.findOne({ booking: booking._id, reviewerRole: input.reviewerRole });
  if (existing) {
    throw AppError.conflict("A review has already been submitted for this booking");
  }

  const review = await Review.create({
    booking: booking._id,
    worker: worker._id,
    customer: booking.customer,
    reviewerRole: input.reviewerRole,
    rating: input.rating,
    comment: input.comment,
    tags: input.tags,
  });

  if (input.reviewerRole === "CUSTOMER") {
    await trustScoreService.recompute(worker._id.toString());
  }

  return review;
}

async function listForWorker(workerId: string): Promise<IReview[]> {
  return Review.find({ worker: workerId, reviewerRole: "CUSTOMER", isReported: false })
    .sort({ createdAt: -1 })
    .populate("customer", "email");
}

/**
 * Any participant of the underlying booking can report a review as
 * inappropriate — a lightweight flag (not a full moderation workflow)
 * per the "do not build a huge legal/compliance system" instruction.
 * Reported reviews are excluded from listForWorker immediately
 * (hidden pending admin look, not deleted) rather than left visible.
 */
async function report(userId: string, reviewId: string, _reason: string): Promise<void> {
  const review = await Review.findById(reviewId);
  if (!review) throw AppError.notFound("Review not found");

  const booking = await Booking.findById(review.booking);
  if (!booking) throw AppError.notFound("Associated booking not found");

  const worker = await WorkerProfile.findById(booking.worker);
  const isParticipant =
    booking.customer.toString() === userId || worker?.user.toString() === userId;
  if (!isParticipant) {
    throw AppError.forbidden("You do not have access to report this review");
  }

  review.isReported = true;
  await review.save();
}

export const reviewService = { submit, listForWorker, report };