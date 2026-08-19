import { useState } from "react";
import { Link } from "react-router-dom";
import { WorkerProfile } from "@/features/workers/types";
import { TrustScoreBadge } from "@/components/ui/TrustScoreBadge";
import { AvailabilityDot } from "@/components/ui/AvailabilityDot";

interface WorkerMapViewProps {
  workers: WorkerProfile[];
  centerLat: number;
  centerLng: number;
}

/**
 * A lightweight, dependency-free "map" — plots workers as positioned
 * dots on a simple grid proportional to their real lat/lng offset from
 * the search center, NOT an actual tile-based map (no Google/Mapbox
 * API key wired in — that's a real paid dependency the brief didn't
 * ask to integrate). This satisfies "simple map/list toggle" and
 * "approximate location" honestly without pretending to be a full
 * mapping SDK. Clicking a marker shows the same info card the brief
 * specifies.
 */
export function WorkerMapView({ workers, centerLat, centerLng }: WorkerMapViewProps) {
  const [selected, setSelected] = useState<WorkerProfile | null>(null);

  function positionFor(worker: WorkerProfile): { top: string; left: string } | null {
    const coords = worker.baseLocation.geoPoint?.coordinates;
    if (!coords) return null;
    const [lng, lat] = coords;

    // Simple linear projection within a ±0.1 degree box around the
    // search center (~11km) — good enough for a locality-level view.
    const latOffset = (lat - centerLat) / 0.1; // -1..1
    const lngOffset = (lng - centerLng) / 0.1;

    const top = 50 - Math.max(-45, Math.min(45, latOffset * 45));
    const left = 50 + Math.max(-45, Math.min(45, lngOffset * 45));

    return { top: `${top}%`, left: `${left}%` };
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-ink-200 bg-trust-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(39,150,144,0.08)_1px,_transparent_1px)] bg-[length:24px_24px]" />

      {/* Center marker = the search location */}
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 ring-4 ring-brand-200" />

      {workers.map((w) => {
        const pos = positionFor(w);
        if (!pos) return null;
        return (
          <button
            key={w._id}
            onClick={() => setSelected(w)}
            style={{ top: pos.top, left: pos.left }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-trust-600 text-xs font-bold text-white shadow-card hover:scale-110"
          >
            {w.fullName.charAt(0)}
          </button>
        );
      })}

      {selected && (
        <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-ink-200 bg-white p-3 shadow-card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-ink-900">{selected.fullName}</p>
              <p className="text-xs text-ink-500">{selected.categories.map((c) => c.name).join(", ")}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-ink-400">
              ✕
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <TrustScoreBadge score={selected.trustScore} isNew={selected.isNewWorker} />
            <AvailabilityDot state={selected.availabilityState} />
          </div>
          {selected.distanceKm !== undefined && (
            <p className="mt-1 text-xs text-ink-500">{selected.distanceKm} km away</p>
          )}
          <Link to={`/customer/workers/${selected._id}`}>
            <button className="mt-2 w-full rounded-lg bg-brand-500 py-1.5 text-xs font-medium text-white">
              View Profile
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}