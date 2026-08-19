import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { ROLES } from "../constants/roles";

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get("/dashboard", analyticsController.getDashboard);
router.get("/applications-over-time", analyticsController.getApplicationsOverTime);
router.get("/top-skills", analyticsController.getTopSkills);
router.get("/avg-ctc-by-role", analyticsController.getAverageCTCByRole);
router.get("/avg-ctc-by-location", analyticsController.getAverageCTCByLocation);
router.get("/funnel", analyticsController.getApplicationFunnel);
router.get("/job-type-distribution", analyticsController.getJobTypeDistribution);
router.get("/work-mode-distribution", analyticsController.getWorkModeDistribution);
router.get("/hiring-trends", analyticsController.getHiringTrends);
router.get("/location-wise-jobs", analyticsController.getLocationWiseJobs);
router.get("/candidate-skills", analyticsController.getCandidateSkillDistribution);

export default router;