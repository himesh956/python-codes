import { ReactNode } from "react";
import { ShieldCheck, Star, Clock } from "lucide-react";

type BadgeVariant = "verified" | "rating" | "available" | "soon" | "busy" | "neutral";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
}

const STYLES: Record<BadgeVariant, string> = {
  verified: "bg-trust-50 text-trust-700 border border-trust-200",
  rating: "bg-amber-50 text-amber-700 border border-amber-200",
  available: "bg-green-50 text-available border border-green-200",
  soon: "bg-amber-50 text-soon border border-amber-200",
  busy: "bg-ink-100 text-busy border border-ink-200",
  neutral: "bg-ink-100 text-ink-600 border border-ink-200",
};

const ICONS: Partial<Record<BadgeVariant, ReactNode>> = {
  verified: <ShieldCheck size={12} />,
  rating: <Star size={12} fill="currentColor" />,
  soon: <Clock size={12} />,
};

/**
 * Trust badges are core UI real estate for LOCALHIRE (see design
 * rationale — verification is the primary trust-building signal, not
 * a footnote). This component is used on every worker card/profile.
 */
export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[variant]}`}
    >
      {ICONS[variant]}
      {children}
    </span>
  );
}