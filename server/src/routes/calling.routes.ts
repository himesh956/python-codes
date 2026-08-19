import { Router } from "express";
import * as callingController from "../controllers/calling.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { initiateCallSchema } from "../validators/calling.validators";

const router = Router();

router.use(authenticate);

router.post("/", validate(initiateCallSchema), callingController.initiateCall);
router.get("/my", callingController.getMyCallHistory);

export default router;