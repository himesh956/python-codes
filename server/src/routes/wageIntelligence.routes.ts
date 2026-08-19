import { Router } from "express";
import * as wageController from "../controllers/wageIntelligence.controller";
import { validate } from "../middlewares/validate";
import { wageEstimateQuerySchema } from "../validators/wageIntelligence.validators";

const router = Router();

// Public — this is a standalone acquisition hook per Part 19 of the
// product plan ("Wage Intelligence page views by non-booking users"),
// so it must be checkable without logging in.
router.get("/estimate", validate(wageEstimateQuerySchema), wageController.getWageEstimate);

export default router;