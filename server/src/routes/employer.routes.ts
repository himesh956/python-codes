import { Router } from "express";
import * as employerController from "../controllers/employer.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { updateEmployerProfileSchema, updateCompanySchema } from "../validators/employer.validators";
import { ROLES } from "../constants/roles";

const router = Router();

// Every route here is employer-only.
router.use(authenticate, authorize(ROLES.EMPLOYER));

router.get("/profile", employerController.getMyProfile);
router.put("/profile", validate(updateEmployerProfileSchema), employerController.updateMyProfile);

router.put("/company", validate(updateCompanySchema), employerController.updateMyCompany);

export default router;
