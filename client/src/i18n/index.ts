import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import hi from "./locales/hi.json";

/**
 * Full Hindi/English UI toggle — an MVP requirement per the product
 * plan (Part 8), not optional polish. LanguageDetector checks
 * localStorage first (persists the user's choice), then browser
 * language, defaulting to English. Devanagari rendering already has
 * extra line-height budget from the global CSS (index.css).
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;