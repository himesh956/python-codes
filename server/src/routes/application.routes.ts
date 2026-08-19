import { Router } from "express";
import * as applicationController from "../controllers/application.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { validateObjectId } from "../middlewares/validateObjectId";
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  listApplicantsQuerySchema,
} from "../validators/application.validators";
import { ROLES } from "../constants/roles";

const router = Router();

router.use(authenticate);

// --- Candidate ---
router.post(
  "/",
  authorize(ROLES.CANDIDATE),
  validate(createApplicationSchema),
  applicationController.apply
);
router.get("/my", authorize(ROLES.CANDIDATE), applicationController.getMyApplications);
router.patch(
  "/:id/withdraw",
  authorize(ROLES.CANDIDATE),
  validateObjectId("id"),
  applicationController.withdraw
);

// --- Employer ---
router.get(
  "/job/:jobId",
  authorize(ROLES.EMPLOYER),
  validateObjectId("jobId"),
  validate(listApplicantsQuerySchema),
  applicationController.listApplicantsForJob
);
router.patch(
  "/:id/status",
  authorize(ROLES.EMPLOYER),
  validateObjectId("id"),
  validate(updateApplicationStatusSchema),
  applicationController.updateApplicationStatus
);

// --- Shared (ownership enforced in service) ---
router.get("/:id", validateObjectId("id"), applicationController.getApplicationById);

export default router;