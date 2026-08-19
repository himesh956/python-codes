import { Router } from "express";
import * as jobController from "../controllers/job.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { validateObjectId } from "../middlewares/validateObjectId";
import {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
  jobSearchQuerySchema,
} from "../validators/job.validators";
import { ROLES } from "../constants/roles";

const router = Router();

// --- Public ---
router.get("/", validate(jobSearchQuerySchema), jobController.searchJobs);

// --- Employer-only (must come before "/:id" so it isn't captured as an id) ---
router.get(
  "/employer/mine",
  authenticate,
  authorize(ROLES.EMPLOYER),
  jobController.listMyJobs
);
router.post(
  "/",
  authenticate,
  authorize(ROLES.EMPLOYER),
  validate(createJobSchema),
  jobController.createJob
);
router.put(
  "/:id",
  authenticate,
  authorize(ROLES.EMPLOYER),
  validateObjectId("id"),
  validate(updateJobSchema),
  jobController.updateJob
);
router.patch(
  "/:id/status",
  authenticate,
  authorize(ROLES.EMPLOYER),
  validateObjectId("id"),
  validate(updateJobStatusSchema),
  jobController.updateJobStatus
);

// --- Public detail (after specific routes) ---
router.get("/:id", validateObjectId("id"), jobController.getJob);

export default router;