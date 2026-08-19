import { Router } from "express";
import * as verificationController from "../controllers/verification.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { validateObjectId } from "../middlewares/validateObjectId";
import { submitVerificationSchema, reviewVerificationSchema } from "../validators/verification.validators";
import { ROLES } from "../constants/roles";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(submitVerificationSchema),
  verificationController.submitVerification
);
router.get("/worker/:workerId", validateObjectId("workerId"), verificationController.listForWorker);

// Admin review queue (GOVT_ID manual approval).
router.get(
  "/admin/pending",
  authenticate,
  authorize(ROLES.ADMIN),
  verificationController.listPendingForAdmin
);
router.patch(
  "/admin/:id/review",
  authenticate,
  authorize(ROLES.ADMIN),
  validateObjectId("id"),
  validate(reviewVerificationSchema),
  verificationController.reviewVerification
);

export default router;