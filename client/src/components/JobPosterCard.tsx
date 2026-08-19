import { forwardRef } from "react";

interface JobPosterCardProps {
  title: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
}

/**
 * The visual card itself, rendered as real DOM (not canvas) so it can
 * be captured via html-to-image at share/download time — kept as a
 * fixed-size div specifically so the captured image has consistent,
 * WhatsApp-friendly dimensions.
 */
export const JobPosterCard = forwardRef<HTMLDivElement, JobPosterCardProps>(
  ({ title, location, salaryMin, salaryMax }, ref) => {
    const salaryText =
      salaryMin && salaryMax
        ? `₹${salaryMin.toLocaleString("en-IN")} - ₹${salaryMax.toLocaleString("en-IN")}/month`
        : salaryMin
          ? `₹${salaryMin.toLocaleString("en-IN")}/month`
          : "Salary: Contact for details";

    return (
      <div
        ref={ref}
        className="flex h-[500px] w-[400px] flex-col justify-between rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white"
      >
        <div>
          <p className="font-display text-sm font-bold tracking-widest text-white/70">LOCALHIRE</p>
          <p className="mt-6 font-display text-3xl font-bold leading-tight">🔥 Hiring: {title}</p>
        </div>

        <div className="space-y-3">
          <p className="flex items-center gap-2 text-lg">📍 {location}</p>
          <p className="flex items-center gap-2 text-lg font-semibold">💰 {salaryText}</p>
          <p className="flex items-center gap-2 text-sm text-white/80">⭐ Local opportunity</p>
        </div>

        <div className="rounded-xl bg-white/15 py-3 text-center font-semibold">Apply on LocalHire</div>
      </div>
    );
  }
);
JobPosterCard.displayName = "JobPosterCard";