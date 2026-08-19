import { Response, Request } from "express";
import { skillQuizService } from "../services/skillQuiz.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createQuiz = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const quiz = await skillQuizService.create(
    req.body.categoryId,
    req.body.questions,
    req.body.passingScore
  );
  sendSuccess(res, 201, { message: "Quiz created", data: { quiz } });
});

export const getQuizForCategory = catchAsync(async (req: Request, res: Response) => {
  const quiz = await skillQuizService.getForCategory(req.params.categoryId);
  sendSuccess(res, 200, { data: { quiz } });
});

export const submitAttempt = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await skillQuizService.submitAttempt(req.user!.id, req.params.quizId, req.body.answers);
  sendSuccess(res, 200, {
    message: result.passed ? "Congratulations, you passed!" : "You did not pass this time.",
    data: result,
  });
});