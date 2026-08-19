import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

import { env } from "./config/env";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import candidateRoutes from "./routes/candidate.routes";
import employerRoutes from "./routes/employer.routes";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";
import savedJobRoutes from "./routes/savedJob.routes";
import notificationRoutes from "./routes/notification.routes";
import interviewRoutes from "./routes/interview.routes";
import recommendationRoutes from "./routes/recommendation.routes";
import adminRoutes from "./routes/admin.routes";
import analyticsRoutes from "./routes/analytics.routes";
import workerCategoryRoutes from "./routes/workerCategory.routes";
import workerRoutes from "./routes/worker.routes";
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
import verificationRoutes from "./routes/verification.routes";
import wageIntelligenceRoutes from "./routes/wageIntelligence.routes";
import trustedWorkersRoutes from "./routes/trustedWorkers.routes";
import disputeRoutes from "./routes/dispute.routes";
import fraudDetectionRoutes from "./routes/fraudDetection.routes";
import skillQuizRoutes from "./routes/skillQuiz.routes";
import bulkBookingRoutes from "./routes/bulkBooking.routes";
import recurringBookingRoutes from "./routes/recurringBooking.routes";
import workerAnalyticsRoutes from "./routes/workerAnalytics.routes";
import chatRoutes from "./routes/chat.routes";
import callingRoutes from "./routes/calling.routes";
import voiceToJobRoutes from "./routes/voiceToJob.routes";
import trustSafetyRoutes from "./routes/trustSafety.routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: env.isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            connectSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
          },
        }
      : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(hpp());

app.use(morgan(env.isProduction ? "combined" : "dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again later.",
  },
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/employers", employerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/worker-categories", workerCategoryRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/verifications", verificationRoutes);
app.use("/api/wage-intelligence", wageIntelligenceRoutes);
app.use("/api/trusted-workers", trustedWorkersRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/fraud-checks", fraudDetectionRoutes);
app.use("/api/skill-quizzes", skillQuizRoutes);
app.use("/api/bulk-bookings", bulkBookingRoutes);
app.use("/api/recurring-bookings", recurringBookingRoutes);
app.use("/api/admin/worker-analytics", workerAnalyticsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/calls", callingRoutes);
app.use("/api/voice-to-job", voiceToJobRoutes);
app.use("/api/trust-safety", trustSafetyRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;