import { Router } from "express";
import * as quizController from "../controllers/skillQuiz.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { validateObjectId } from "../middlewares/validateObjectId";
import { createQuizSchema, submitAttemptSchema } from "../validators/skillQuiz.validators";
import { ROLES } from "../constants/roles";

const router = Router();

router.get("/category/:categoryId", validateObjectId("categoryId"), quizController.getQuizForCategory);
router.post(
  "/:quizId/attempt",
  authenticate,
  validateObjectId("quizId"),
  validate(submitAttemptSchema),
  quizController.submitAttempt
);

router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createQuizSchema),
  quizController.createQuiz
);

export default router;