import { SkillQuiz, ISkillQuiz } from "../models/SkillQuiz";
import { SkillQuizAttempt } from "../models/SkillQuizAttempt";
import { WorkerProfile } from "../models/WorkerProfile";
import { Verification } from "../models/Verification";
import { AppError } from "../utils/AppError";
import { trustScoreService } from "./trustScore.service";

async function create(categoryId: string, questions: ISkillQuiz["questions"], passingScore: number) {
  const existing = await SkillQuiz.findOne({ category: categoryId });
  if (existing) throw AppError.conflict("A quiz already exists for this category");

  return SkillQuiz.create({ category: categoryId, questions, passingScore, isActive: true });
}

/** Worker-facing — never exposes correctOptionIndex, only question + options. */
async function getForCategory(categoryId: string) {
  const quiz = await SkillQuiz.findOne({ category: categoryId, isActive: true });
  if (!quiz) return null;

  return {
    _id: quiz._id,
    category: quiz.category,
    questions: quiz.questions.map((q) => ({ question: q.question, options: q.options })),
  };
}

async function submitAttempt(
  userId: string,
  quizId: string,
  answers: number[]
): Promise<{ score: number; passed: boolean }> {
  const worker = await WorkerProfile.findOne({ user: userId });
  if (!worker) throw AppError.notFound("Worker profile not found");

  const quiz = await SkillQuiz.findById(quizId);
  if (!quiz) throw AppError.notFound("Quiz not found");

  if (answers.length !== quiz.questions.length) {
    throw AppError.badRequest("Answer count does not match question count");
  }

  const score = quiz.questions.reduce(
    (total, q, i) => (answers[i] === q.correctOptionIndex ? total + 1 : total),
    0
  );
  const passed = score >= quiz.passingScore;

  await SkillQuizAttempt.create({ worker: worker._id, quiz: quiz._id, score, passed });

  if (passed) {
    await Verification.findOneAndUpdate(
      { worker: worker._id, type: "SKILL_TEST" },
      { $set: { status: "VERIFIED", verifiedAt: new Date() } },
      { upsert: true }
    );
    await trustScoreService.recompute(worker._id.toString());
  }

  return { score, passed };
}

export const skillQuizService = { create, getForCategory, submitAttempt };