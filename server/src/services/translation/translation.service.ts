import { ITranslationProvider, SupportedLanguage, TranslationResult } from "./translationProvider.interface";
import { GoogleTranslateProvider } from "./googleTranslateProvider";
import { DictionaryTranslationProvider } from "./dictionaryTranslationProvider";

/**
 * Picks the best available provider at call time — prefers a real
 * provider if configured, falls back to the dictionary otherwise.
 * Callers (chat.service.ts) never know or care which one ran.
 */
const googleProvider: ITranslationProvider = new GoogleTranslateProvider();
const fallbackProvider: ITranslationProvider = new DictionaryTranslationProvider();

async function translate(text: string, targetLanguage: SupportedLanguage): Promise<TranslationResult> {
  const provider = googleProvider.isAvailable() ? googleProvider : fallbackProvider;

  try {
    return await provider.translate(text, targetLanguage);
  } catch {
    // If the preferred provider fails at call time (network error,
    // quota, etc), fall back rather than surfacing a raw error to the
    // user — a failed translation should never block chat.
    if (provider !== fallbackProvider) {
      return fallbackProvider.translate(text, targetLanguage);
    }
    throw new Error("Translation is currently unavailable");
  }
}

export const translationService = { translate };