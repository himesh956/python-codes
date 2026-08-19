import { useTranslation } from "react-i18next";

export type AvailabilityState = "AVAILABLE_NOW" | "AVAILABLE_TODAY" | "BUSY" | "OFFLINE";

const CONFIG: Record<AvailabilityState, { color: string; key: string }> = {
  AVAILABLE_NOW: { color: "bg-available", key: "worker.availableNow" },
  AVAILABLE_TODAY: { color: "bg-soon", key: "worker.availableToday" },
  BUSY: { color: "bg-busy", key: "worker.busy" },
  OFFLINE: { color: "bg-ink-300", key: "worker.offline" },
};

export function AvailabilityDot({ state, showLabel = true }: { state: AvailabilityState; showLabel?: boolean }) {
  const { t } = useTranslation();
  const config = CONFIG[state];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-600">
      <span className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
      {showLabel && t(config.key)}
    </span>
  );
}