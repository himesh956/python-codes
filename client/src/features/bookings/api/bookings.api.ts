import { api } from "@/lib/api";
import { Booking } from "../types";

export async function createBooking(payload: {
  workerId: string;
  categoryId: string;
  isUrgent: boolean;
  requestedFor: string;
  agreedWage: { type: string; amount: number };
  location: { city: string; addressNote?: string };
}): Promise<Booking> {
  const res = await api.post("/bookings", payload);
  return res.data.data.booking;
}

export async function respondToBooking(id: string, action: "ACCEPT" | "DECLINE"): Promise<Booking> {
  const res = await api.patch(`/bookings/${id}/respond`, { action });
  return res.data.data.booking;
}

export async function updateBookingStatus(
  id: string,
  status: string,
  as: "customer" | "worker"
): Promise<Booking> {
  const res = await api.patch(`/bookings/${id}/status?as=${as}`, { status });
  return res.data.data.booking;
}

export async function getMyBookingsAsCustomer(): Promise<Booking[]> {
  const res = await api.get("/bookings/my/as-customer");
  return res.data.data.bookings;
}

export async function getMyBookingsAsWorker(): Promise<Booking[]> {
  const res = await api.get("/bookings/my/as-worker");
  return res.data.data.bookings;
}

export async function submitReview(payload: {
  bookingId: string;
  reviewerRole: "CUSTOMER" | "WORKER";
  rating: number;
  comment?: string;
}) {
  const res = await api.post("/reviews", payload);
  return res.data.data.review;
}