import { Router } from "express";
import * as interviewController from "../controllers/interview.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { scheduleInterviewSchema, updateInterviewSchema } from "../validators/interview.validators";
import { ROLES } from "../constants/roles";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(ROLES.EMPLOYER),
  validate(scheduleInterviewSchema),
  interviewController.scheduleInterview
);
router.put(
  "/:id",
  authorize(ROLES.EMPLOYER),
  validate(updateInterviewSchema),
  interviewController.updateInterview
);
router.get(
  "/application/:applicationId",
  authorize(ROLES.EMPLOYER),
  interviewController.listInterviewsForApplication
);

router.get(
  "/my-upcoming",
  authorize(ROLES.CANDIDATE),
  interviewController.listMyUpcomingInterviews
);

export default router;