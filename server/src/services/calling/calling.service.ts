import { Call, ICall, CallContextType } from "../../models/Call";
import { Booking } from "../../models/Booking";
import { Application } from "../../models/Application";
import { WorkerProfile } from "../../models/WorkerProfile";
import { CandidateProfile } from "../../models/CandidateProfile";
import { AppError } from "../../utils/AppError";
import { MockCallingProvider } from "./mockCallingProvider";
import { ICallingProvider } from "./callingProvider.interface";

const provider: ICallingProvider = new MockCallingProvider();

/**
 * Same ownership pattern as chat.service.ts's verifyValidInteraction —
 * a call can only be initiated between two users who share a real
 * booking or application, verified server-side. Reusing this pattern
 * (rather than trusting a "we already chatted" client-side flag) is
 * what the brief calls "call only after valid interaction."
 */
async function verifyValidInteraction(
  userId: string,
  otherUserId: string,
  contextType: CallContextType,
  contextId: string
): Promise<void> {
  if (contextType === "BOOKING") {
    const booking = await Booking.findById(contextId);

    if (!booking) {
      throw AppError.notFound("Booking not found");
    }

    const worker = await WorkerProfile.findById(booking.worker);

    const isCustomerPair =
      booking.customer.toString() === userId &&
      worker?.user.toString() === otherUserId;

    const isWorkerPair =
      booking.customer.toString() === otherUserId &&
      worker?.user.toString() === userId;

    if (!isCustomerPair && !isWorkerPair) {
      throw AppError.forbidden(
        "You do not have a valid booking with this user"
      );
    }

    return;
  }

  const application = await Application.findById(contextId);

  if (!application) {
    throw AppError.notFound("Application not found");
  }

  const candidate = await CandidateProfile.findById(
    application.candidate
  );

  const { EmployerProfile } = await import(
    "../../models/EmployerProfile"
  );

  const employer = await EmployerProfile.findById(
    application.employer
  );

  const isCandidateSide =
    candidate?.user.toString() === userId;

  const isEmployerSide =
    employer?.user.toString() === userId;

  const otherIsCandidateSide =
    candidate?.user.toString() === otherUserId;

  const otherIsEmployerSide =
    employer?.user.toString() === otherUserId;

  const validPair =
    (isCandidateSide && otherIsEmployerSide) ||
    (isEmployerSide && otherIsCandidateSide);

  if (!validPair) {
    throw AppError.forbidden(
      "You do not have a valid application with this user"
    );
  }
}

/**
 * Basic abuse protection (Phase 3 requirement): caps call attempts
 * per caller per hour, independent of the express-rate-limit
 * middleware layer (that one is IP-based; this one is per-user,
 * meaningful even behind a shared IP/NAT).
 */
async function checkRateLimit(
  callerId: string
): Promise<void> {
  const oneHourAgo = new Date(
    Date.now() - 60 * 60 * 1000
  );

  const recentCallCount = await Call.countDocuments({
    caller: callerId,
    createdAt: {
      $gte: oneHourAgo,
    },
  });

  if (recentCallCount >= 10) {
    throw AppError.badRequest(
      "Too many call attempts. Please try again later."
    );
  }
}

async function initiate(
  callerId: string,
  receiverId: string,
  contextType: CallContextType,
  contextId: string
): Promise<ICall> {
  if (callerId === receiverId) {
    throw AppError.badRequest(
      "You cannot call yourself"
    );
  }

  await verifyValidInteraction(
    callerId,
    receiverId,
    contextType,
    contextId
  );

  await checkRateLimit(callerId);

  if (!provider.isAvailable()) {
    // Still record the attempt (useful for demand signal / admin
    // visibility into how often calling is requested), marked FAILED
    // immediately, before surfacing a clear "not available yet"
    // message to the caller rather than a raw provider error.
    await Call.create({
      caller: callerId,
      receiver: receiverId,
      contextType,
      contextId,
      status: "FAILED",
    });

    throw AppError.badRequest(
      "Calling is not available yet. Please use chat to message this person instead."
    );
  }

  const result = await provider.initiateCall({
    callerId,
    receiverId,
    contextId,
  });

  return Call.create({
    caller: callerId,
    receiver: receiverId,
    contextType,
    contextId,
    providerCallId: result.providerCallId,
    status: result.status,
  });
}

async function getMyCallHistory(
  userId: string
): Promise<ICall[]> {
  return Call.find({
    $or: [
      { caller: userId },
      { receiver: userId },
    ],
  })
    .sort({ createdAt: -1 })
    .populate("caller", "email")
    .populate("receiver", "email");
}

export const callingService = {
  initiate,
  getMyCallHistory,
};