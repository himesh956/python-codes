import { RecurringBookingSchedule, IRecurringBookingSchedule } from "../models/RecurringBookingSchedule";
import { Booking } from "../models/Booking";
import { WorkerProfile } from "../models/WorkerProfile";
import { AppError } from "../utils/AppError";
import { notificationService } from "./notification.service";

interface CreateScheduleInput {
  workerId: string;
  categoryId: string;
  pattern: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
  dayOfWeek: number;
  timeOfDay: string;
  agreedWage: { type: string; amount: number };
  location: { city: string; addressNote?: string };
}

function computeNextRun(pattern: string, dayOfWeek: number, timeOfDay: string): Date {
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  const now = new Date();
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
  next.setDate(now.getDate() + (daysUntilTarget === 0 && next <= now ? 7 : daysUntilTarget));

  return next;
}

function advanceNextRun(current: Date, pattern: string): Date {
  const next = new Date(current);
  if (pattern === "WEEKLY") next.setDate(next.getDate() + 7);
  else if (pattern === "BIWEEKLY") next.setDate(next.getDate() + 14);
  else next.setMonth(next.getMonth() + 1); // MONTHLY
  return next;
}

async function create(
  customerUserId: string,
  input: CreateScheduleInput
): Promise<IRecurringBookingSchedule> {
  const worker = await WorkerProfile.findById(input.workerId);
  if (!worker) throw AppError.notFound("Worker not found");

  const nextRunAt = computeNextRun(input.pattern, input.dayOfWeek, input.timeOfDay);

  return RecurringBookingSchedule.create({
    customer: customerUserId,
    worker: worker._id,
    category: input.categoryId,
    pattern: input.pattern,
    dayOfWeek: input.dayOfWeek,
    timeOfDay: input.timeOfDay,
    agreedWage: { ...input.agreedWage, currency: "INR" },
    location: input.location,
    isActive: true,
    nextRunAt,
  });
}

async function cancel(customerUserId: string, scheduleId: string): Promise<void> {
  const schedule = await RecurringBookingSchedule.findById(scheduleId);
  if (!schedule) throw AppError.notFound("Recurring schedule not found");
  if (schedule.customer.toString() !== customerUserId) {
    throw AppError.forbidden("You do not have permission to cancel this schedule");
  }
  schedule.isActive = false;
  await schedule.save();
}

async function getMySchedules(customerUserId: string): Promise<IRecurringBookingSchedule[]> {
  return RecurringBookingSchedule.find({ customer: customerUserId, isActive: true })
    .sort({ nextRunAt: 1 })
    .populate("worker", "fullName photoUrl")
    .populate("category", "name icon");
}

/**
 * Generates a real Booking from each due schedule, then advances
 * nextRunAt — called by a background sweeper, same lightweight
 * setInterval pattern as the urgent-booking sweeper (Phase 10),
 * appropriate for a single-instance MVP deployment.
 */
async function generateDueBookings(): Promise<number> {
  const due = await RecurringBookingSchedule.find({
    isActive: true,
    nextRunAt: { $lte: new Date() },
  });

  for (const schedule of due) {
    const booking = await Booking.create({
      customer: schedule.customer,
      worker: schedule.worker,
      category: schedule.category,
      isUrgent: false,
      requestedFor: schedule.nextRunAt,
      status: "REQUESTED",
      statusHistory: [{ status: "REQUESTED", changedAt: new Date() }],
      agreedWage: schedule.agreedWage,
      location: schedule.location,
      isRepeatBooking: true,
    });

    const worker = await WorkerProfile.findById(schedule.worker);
    if (worker) {
      await notificationService.create({
        recipient: worker.user,
        type: "NEW_APPLICATION",
        message: "A recurring booking request has come in",
        relatedEntity: { kind: "APPLICATION", id: booking._id },
      });
    }

    schedule.lastGeneratedAt = new Date();
    schedule.nextRunAt = advanceNextRun(schedule.nextRunAt, schedule.pattern);
    await schedule.save();
  }

  return due.length;
}

export const recurringBookingService = { create, cancel, getMySchedules, generateDueBookings };