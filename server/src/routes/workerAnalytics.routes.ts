import { Router } from "express";
import * as workerAnalyticsController from "../controllers/workerAnalytics.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { ROLES } from "../constants/roles";

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get("/dashboard", workerAnalyticsController.getDashboard);
router.get("/category-demand", workerAnalyticsController.getCategoryDemand);
router.get("/wage-by-category", workerAnalyticsController.getAverageWageByCategory);
router.get("/top-rated-workers", workerAnalyticsController.getTopRatedWorkers);
router.get("/category-growth", workerAnalyticsController.getCategoryGrowthTrend);

export default router;