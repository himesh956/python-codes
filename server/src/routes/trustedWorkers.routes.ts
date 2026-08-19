import { Router } from "express";
import * as trustedWorkersController from "../controllers/trustedWorkers.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/my", authenticate, trustedWorkersController.getMyTrustedWorkers);

export default router;