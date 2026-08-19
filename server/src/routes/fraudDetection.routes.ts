import { Router } from "express";
import * as fraudController from "../controllers/fraudDetection.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validateObjectId } from "../middlewares/validateObjectId";
import { ROLES } from "../constants/roles";

const router = Router();

// Admin-only — these are investigative tools, not user-facing.
router.get(
  "/worker/:workerId",
  authenticate,
  authorize(ROLES.ADMIN),
  validateObjectId("workerId"),
  fraudController.checkWorkerFlags
);
router.get(
  "/user/:userId",
  authenticate,
  authorize(ROLES.ADMIN),
  validateObjectId("userId"),
  fraudController.checkUserFlags
);

export default router;