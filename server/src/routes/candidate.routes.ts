import { Router } from "express";
import * as candidateController from "../controllers/candidate.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { uploadResume } from "../middlewares/upload.middleware";
import { updateCandidateProfileSchema } from "../validators/candidate.validators";
import { ROLES } from "../constants/roles";

const router = Router();

// Every route here is candidate-only.
router.use(authenticate, authorize(ROLES.CANDIDATE));

router.get("/profile", candidateController.getMyProfile);
router.put("/profile", validate(updateCandidateProfileSchema), candidateController.updateMyProfile);

router.post("/resume", uploadResume, candidateController.uploadResume);
router.delete("/resume", candidateController.deleteResume);

export default router;
