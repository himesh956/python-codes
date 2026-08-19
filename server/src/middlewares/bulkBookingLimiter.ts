import rateLimit from "express-rate-limit";

/**
 * Bulk requests fan out to many workers at once (up to 30 per
 * request) — a tighter limit than general API usage prevents someone
 * from spamming a whole city's worker pool with repeated large bulk
 * requests (Part 12 of the product plan: "spam bookings" threat).
 */
export const bulkBookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many bulk booking requests. Please try again later.",
  },
});