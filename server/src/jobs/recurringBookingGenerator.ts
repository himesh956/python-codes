import { recurringBookingService } from "../services/recurringBooking.service";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly — recurring bookings aren't time-sensitive like urgent ones

export function startRecurringBookingGenerator(): void {
  setInterval(async () => {
    try {
      const count = await recurringBookingService.generateDueBookings();
      if (count > 0) {
        // eslint-disable-next-line no-console
        console.log(`[recurring-generator] Generated ${count} recurring booking(s)`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[recurring-generator] Generation failed:", err);
    }
  }, CHECK_INTERVAL_MS);
}