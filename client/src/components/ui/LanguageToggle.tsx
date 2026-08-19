import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

/**
 * Placed in the nav (landing page) and the dashboard sidebar footer —
 * always reachable, never buried in a settings menu, since language
 * is an accessibility need, not a preference to hunt for.
 */
export function LanguageToggle() {
  const { i18n } = useTranslation();

  function toggle() {
    const next = i18n.language.startsWith("hi") ? "en" : "hi";
    i18n.changeLanguage(next);
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50"
    >
      <Languages size={14} />
      {i18n.language.startsWith("hi") ? "English" : "हिंदी"}
    </button>
  );
}