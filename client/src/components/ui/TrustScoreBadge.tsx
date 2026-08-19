import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export function TrustScoreBadge({ score, isNew }: { score: number; isNew?: boolean }) {
  const { t } = useTranslation();

  if (isNew) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-trust-50 px-2.5 py-1 text-xs font-semibold text-trust-700">
        <ShieldCheck size={13} /> {t("worker.newVerified")}
      </span>
    );
  }

  const tier = score >= 80 ? "bg-trust-500 text-white" : score >= 50 ? "bg-trust-100 text-trust-700" : "bg-ink-100 text-ink-600";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tier}`}>
      <ShieldCheck size={13} /> {score} {t("worker.trustScore")}
    </span>
  );
}