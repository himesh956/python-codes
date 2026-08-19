import { ITranslationProvider, SupportedLanguage, TranslationResult } from "./translationProvider.interface";

/**
 * MVP fallback provider — a small phrase dictionary covering the most
 * common booking-related phrases, NOT a real translation engine. This
 * exists so the "Translate" button always does *something* useful
 * without requiring an external API key to be configured, per the
 * product brief's explicit instruction: "if AI is unavailable, fallback
 * gracefully" (same principle applied here to translation). Real
 * coverage comes from swapping in a real provider (see
 * googleTranslateProvider.ts stub below) once an API key exists.
 */
const HI_TO_EN_PHRASES: Record<string, string> = {
  "kal subah aa sakta hu": "I can come tomorrow morning",
  "kal subah 9 baje aa sakta hu": "I can come tomorrow at 9 AM",
  "kitna paisa lagega": "How much will it cost",
  "kab tak ho jayega": "When will it be done",
  "main aa raha hu": "I am coming",
  "thik hai": "Okay",
  "haan": "Yes",
  "nahi": "No",
  "dhanyavaad": "Thank you",
  "namaste": "Hello",
  "kitne baje": "What time",
  "kal": "Tomorrow",
  "aaj": "Today",
};

const EN_TO_HI_PHRASES: Record<string, string> = Object.fromEntries(
  Object.entries(HI_TO_EN_PHRASES).map(([hi, en]) => [en.toLowerCase(), hi])
);

export class DictionaryTranslationProvider implements ITranslationProvider {
  isAvailable(): boolean {
    return true; // always available — it's local, no external dependency
  }

  async translate(text: string, targetLanguage: SupportedLanguage): Promise<TranslationResult> {
    const normalized = text.trim().toLowerCase();
    const dictionary = targetLanguage === "EN" ? HI_TO_EN_PHRASES : EN_TO_HI_PHRASES;

    const exactMatch = dictionary[normalized];
    if (exactMatch) {
      return { translatedText: exactMatch, translatedLanguage: targetLanguage };
    }

    // No match — return the original text with a clear marker rather
    // than pretending to translate. Honest degradation over silent
    // wrong output.
    return {
      translatedText: `${text} (translation not available for this phrase)`,
      translatedLanguage: targetLanguage,
    };
  }
}