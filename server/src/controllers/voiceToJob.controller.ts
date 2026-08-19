import { Response } from "express";
import { voiceToJobService } from "../services/ai/voiceToJob.service";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

/**
 * Called with a transcript already produced client-side (browser
 * SpeechRecognition API) — this endpoint only runs structured
 * extraction, never publishes anything. See processAudio (unused
 * route below) for the server-side-STT path, dormant until a real
 * provider is configured.
 */
export const processTranscript = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await voiceToJobService.processTranscript(req.body.transcript);
  sendSuccess(res, 200, { data: result });
});