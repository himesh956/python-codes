import { Router } from "express";
import * as savedJobController from "../controllers/savedJob.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { saveJobSchema } from "../validators/savedJob.validators";
import { ROLES } from "../constants/roles";

const router = Router();

router.use(authenticate, authorize(ROLES.CANDIDATE));

router.get("/", savedJobController.listMySavedJobs);
router.post("/", validate(saveJobSchema), savedJobController.saveJob);
router.delete("/:jobId", savedJobController.unsaveJob);

export default router;
