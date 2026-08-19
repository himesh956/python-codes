import { MockSpeechToTextProvider } from "./mockSpeechToTextProvider";
import { RuleBasedJobExtractionProvider } from "./ruleBasedJobExtractionProvider";
import { ExtractedJobData } from "./jobExtraction.interface";
import { AppError } from "../../utils/AppError";

const sttProvider = new MockSpeechToTextProvider();
const extractionProvider = new RuleBasedJobExtractionProvider();

interface VoiceToJobResult {
  transcript: string;
  extracted: ExtractedJobData;
  usedRealSTT: boolean;
}

/**
 * Orchestrates STT -> extraction. If real STT isn't configured
 * (current state), the caller is expected to have already transcribed
 * client-side using the browser's native SpeechRecognition API (see
 * frontend VoiceJobRecorder component) and pass the transcript
 * directly — this function still runs extraction on it either way.
 * This is the "AI must NOT directly publish the job" boundary: this
 * service only returns structured DATA, never calls Job.create()
 * itself — that only happens when the employer taps "Post Job" on the
 * confirmation screen, via the normal existing job.service.ts create().
 */
async function processTranscript(transcript: string): Promise<VoiceToJobResult> {
  if (!transcript || transcript.trim().length < 5) {
    throw AppError.badRequest("Could not understand the recording. Please try again or use the manual form.");
  }

  const extracted = await extractionProvider.extract(transcript);

  return { transcript, extracted, usedRealSTT: sttProvider.isAvailable() };
}

async function processAudio(_audioBuffer: Buffer, _mimeType: string): Promise<VoiceToJobResult> {
  if (!sttProvider.isAvailable()) {
    throw AppError.badRequest(
      "Voice-to-text is not available on the server yet. Please use your device's voice typing, or fill the form manually."
    );
  }
  // Real path (once a provider is configured):
  // const transcript = await sttProvider.transcribe(_audioBuffer, _mimeType);
  // return processTranscript(transcript);
  throw AppError.badRequest("Voice-to-text is not available yet.");
}

export const voiceToJobService = { processTranscript, processAudio };