import { Router } from "express";
import * as recommendationController from "../controllers/recommendation.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { ROLES } from "../constants/roles";

const router = Router();

router.use(authenticate, authorize(ROLES.CANDIDATE));

router.get("/", recommendationController.getMyRecommendations);

export default router;