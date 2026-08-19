import { Router } from "express";
import * as workerController from "../controllers/worker.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { validateObjectId } from "../middlewares/validateObjectId";
import {
  upsertWorkerProfileSchema,
  updateAvailabilitySchema,
  workerSearchQuerySchema,
} from "../validators/worker.validators";

const router = Router();

// --- Public ---
router.get("/", validate(workerSearchQuerySchema), workerController.searchWorkers);

// --- Authenticated (any role — a candidate/employer user can also become a worker) ---
router.get("/me", authenticate, workerController.getMyProfile);
router.put(
  "/me",
  authenticate,
  validate(upsertWorkerProfileSchema),
  workerController.upsertMyProfile
);
router.patch(
  "/me/availability",
  authenticate,
  validate(updateAvailabilitySchema),
  workerController.updateAvailability
);

// --- Public detail (after specific routes) ---
router.get("/:id", validateObjectId("id"), workerController.getWorkerById);

export default router;