import { Router } from "express";
import * as voiceToJobController from "../controllers/voiceToJob.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { processTranscriptSchema } from "../validators/voiceToJob.validators";
import { ROLES } from "../constants/roles";

const router = Router();

router.post(
  "/process-transcript",
  authenticate,
  authorize(ROLES.EMPLOYER),
  validate(processTranscriptSchema),
  voiceToJobController.processTranscript
);

export default router;