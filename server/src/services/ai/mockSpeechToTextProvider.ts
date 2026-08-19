import { ISpeechToTextProvider } from "./speechToText.interface";

/**
 * Honestly unavailable until a real STT API key exists (see
 * env.speechToTextApiKey) — this is what drives the "AI unavailable →
 * fallback to manual form" flow required by the brief. A real
 * implementation (Google Speech-to-Text, Whisper API, etc.) would
 * implement this same interface and be swapped in below.
 */
export class MockSpeechToTextProvider implements ISpeechToTextProvider {
  isAvailable(): boolean {
    return false;
  }

  async transcribe(_audioBuffer: Buffer, _mimeType: string): Promise<string> {
    throw new Error("Speech-to-text is not configured yet");
  }
}