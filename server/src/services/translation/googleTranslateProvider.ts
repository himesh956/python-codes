import { ITranslationProvider, SupportedLanguage, TranslationResult } from "./translationProvider.interface";
import { env } from "../../config/env";

/**
 * Stub for a real provider — NOT wired up to an actual API call at
 * MVP, since no Google Cloud Translation API key exists in this
 * project's env yet. Shows the exact shape a real implementation
 * would take: check for the API key, call the provider, map its
 * response to our TranslationResult shape. isAvailable() returning
 * false is what triggers the graceful fallback to
 * DictionaryTranslationProvider in translation.service.ts below —
 * this is the "graceful fallback rather than pretending the feature
 * is fully integrated" principle from the product brief.
 */
export class GoogleTranslateProvider implements ITranslationProvider {
  isAvailable(): boolean {
    return Boolean(env.googleTranslateApiKey);
  }

  async translate(_text: string, _targetLanguage: SupportedLanguage): Promise<TranslationResult> {
    if (!this.isAvailable()) {
      throw new Error("Google Translate API key not configured");
    }
    // Real implementation would call the Google Cloud Translation API
    // here, e.g.:
    //   const res = await fetch(`https://translation.googleapis.com/...`, {...})
    // Left unimplemented intentionally — wire this up when a real
    // API key is provisioned, without touching any calling code.
    throw new Error("GoogleTranslateProvider is not yet implemented — add an API key and implement translate()");
  }
}