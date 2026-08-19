import { Router } from "express";
import * as reviewController from "../controllers/review.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { validateObjectId } from "../middlewares/validateObjectId";
import { createReviewSchema, reportReviewSchema } from "../validators/review.validators";

const router = Router();

router.post("/", authenticate, validate(createReviewSchema), reviewController.submitReview);
router.get("/worker/:workerId", validateObjectId("workerId"), reviewController.listReviewsForWorker);
router.post(
  "/:id/report",
  authenticate,
  validateObjectId("id"),
  validate(reportReviewSchema),
  reviewController.reportReview
);

export default router;