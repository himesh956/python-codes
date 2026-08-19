import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { startUrgentBookingSweeper } from "./jobs/urgentBookingSweeper";
import { startRecurringBookingGenerator } from "./jobs/recurringBookingGenerator";

async function bootstrap(): Promise<void> {
  await connectDB();

  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] LOCALHIRE API running on port ${env.port} (${env.nodeEnv})`);
  });

  startUrgentBookingSweeper();
  startRecurringBookingGenerator();

  const shutdown = (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[server] Received ${signal}, shutting down gracefully...`);
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("[server] Fatal startup error:", error);
  process.exit(1);
});