import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Wrench, Briefcase, ShieldCheck, Clock, IndianRupee, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-ink-50">
      <nav className="flex items-center justify-between px-6 py-4">
        <span className="font-display text-xl font-bold text-brand-600">{t("common.appName")}</span>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link to="/login" className="text-sm font-medium text-ink-600 hover:text-ink-900">
            {t("common.login")}
          </Link>
          <Link to="/register">
            <Button size="sm">{t("common.getStarted")}</Button>
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 pt-12 text-center sm:pt-20">
        <h1 className="font-display text-3xl font-bold leading-tight text-ink-900 sm:text-5xl">
          {t("landing.heroTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-ink-600 sm:text-lg">
          {t("landing.heroSubtitle")}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link to="/register?intent=hire">
            <Card hoverable className="flex h-full flex-col items-center gap-3 py-8 text-center">
              <div className="rounded-2xl bg-brand-50 p-4 text-brand-600">
                <Wrench size={28} />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-ink-900">{t("landing.hireCard")}</p>
                <p className="mt-1 text-sm text-ink-500">{t("landing.hireCardDesc")}</p>
              </div>
            </Card>
          </Link>

          <Link to="/register?intent=job">
            <Card hoverable className="flex h-full flex-col items-center gap-3 py-8 text-center">
              <div className="rounded-2xl bg-trust-50 p-4 text-trust-600">
                <Briefcase size={28} />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-ink-900">{t("landing.jobCard")}</p>
                <p className="mt-1 text-sm text-ink-500">{t("landing.jobCardDesc")}</p>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <TrustPoint icon={<ShieldCheck size={20} />} label={t("landing.trustVerified")} />
          <TrustPoint icon={<Clock size={20} />} label={t("landing.trustAvailable")} />
          <TrustPoint icon={<IndianRupee size={20} />} label={t("landing.trustWage")} />
          <TrustPoint icon={<Users size={20} />} label={t("landing.trustReviews")} />
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-4xl px-6 pb-24">
        <h2 className="text-center font-display text-2xl font-bold text-ink-900">{t("landing.howItWorks")}</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Step number="1" title={t("landing.step1Title")} text={t("landing.step1Text")} />
          <Step number="2" title={t("landing.step2Title")} text={t("landing.step2Text")} />
          <Step number="3" title={t("landing.step3Title")} text={t("landing.step3Text")} />
        </div>
      </section>
    </div>
  );
}

function TrustPoint({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="rounded-xl bg-white p-3 text-trust-600 shadow-card">{icon}</div>
      <span className="text-xs font-medium text-ink-600">{label}</span>
    </div>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-display text-lg font-bold text-white">
        {number}
      </div>
      <p className="mt-3 font-display font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{text}</p>
    </div>
  );
}