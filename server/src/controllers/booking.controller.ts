import { Response } from "express";
import { bookingService } from "../services/booking.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createBooking = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const booking = await bookingService.create(req.user!.id, req.body);
  sendSuccess(res, 201, { message: "Booking request sent", data: { booking } });
});

export const respondToBooking = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const booking = await bookingService.respond(req.user!.id, req.params.id, req.body.action);
  sendSuccess(res, 200, { message: `Booking ${booking.status.toLowerCase()}`, data: { booking } });
});

export const updateBookingStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const role = req.query.as === "worker" ? "WORKER" : "CUSTOMER";
  const booking = await bookingService.updateStatus(req.user!.id, role, req.params.id, req.body.status);
  sendSuccess(res, 200, { message: `Booking moved to ${booking.status}`, data: { booking } });
});

export const getMyBookingsAsCustomer = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const bookings = await bookingService.getMyBookingsAsCustomer(req.user!.id);
  sendSuccess(res, 200, { data: { bookings } });
});

export const getMyBookingsAsWorker = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const bookings = await bookingService.getMyBookingsAsWorker(req.user!.id);
  sendSuccess(res, 200, { data: { bookings } });
});

export const getBookingById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const booking = await bookingService.getById(req.user!.id, req.params.id);
  sendSuccess(res, 200, { data: { booking } });
});