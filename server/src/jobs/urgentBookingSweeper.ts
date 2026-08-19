import { urgentBookingService } from "../services/urgentBooking.service";

const SWEEP_INTERVAL_MS = 60 * 1000; // every 60 seconds — tight enough for a 10-min urgent window to feel responsive

/**
 * A simple setInterval-based sweeper — deliberately NOT a full job
 * queue (Bull/Agenda) at this stage; the sweep is cheap (indexed query
 * on respondBy) and the app is a single instance, so a background
 * interval inside the same process is sufficient. Revisit if/when the
 * app scales to multiple instances (would need a proper distributed
 * job scheduler then, to avoid double-processing).
 */
export function startUrgentBookingSweeper(): void {
  setInterval(async () => {
    try {
      const count = await urgentBookingService.sweepExpiredUrgentRequests();
      if (count > 0) {
        // eslint-disable-next-line no-console
        console.log(`[urgent-sweeper] Expired ${count} urgent booking request(s)`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[urgent-sweeper] Sweep failed:", err);
    }
  }, SWEEP_INTERVAL_MS);
}