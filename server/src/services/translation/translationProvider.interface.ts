export type SupportedLanguage = "HI" | "EN";

export interface TranslationResult {
  translatedText: string;
  translatedLanguage: SupportedLanguage;
}

/**
 * Provider abstraction — per the product brief, "create a translation
 * service abstraction so the provider can be changed later." Any real
 * implementation (Google Translate, Azure Translator, an LLM call)
 * just needs to satisfy this interface; the rest of the app never
 * knows which one is active.
 */
export interface ITranslationProvider {
  translate(text: string, targetLanguage: SupportedLanguage): Promise<TranslationResult>;
  isAvailable(): boolean;
}