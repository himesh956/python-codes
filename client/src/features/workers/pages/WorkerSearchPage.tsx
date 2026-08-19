import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { List, Map as MapIcon, LocateFixed } from "lucide-react";
import { searchWorkers } from "../api/workers.api";
import { getMyTrustedWorkers } from "@/features/bookings/api/trustedWorkers.api";
import { useGeolocation } from "../hooks/useGeolocation";
import { WorkerCard } from "@/components/WorkerCard";
import { WorkerFilterSidebar } from "@/components/WorkerFilterSidebar";
import { WorkerMapView } from "@/components/WorkerMapView";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { WorkerSearchFilters } from "../types";

export default function WorkerSearchPage() {
  const [filters, setFilters] = useState<WorkerSearchFilters>({ page: 1, limit: 12 });
  const [view, setView] = useState<"LIST" | "MAP">("LIST");
  const { coords, isLoading: locLoading, request: requestLocation } = useGeolocation();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["worker-search", filters],
    queryFn: () => searchWorkers(filters),
    retry: 1,
  });

  const { data: trustedWorkers } = useQuery({
    queryKey: ["trusted-workers"],
    queryFn: getMyTrustedWorkers,
  });

  function handleNearMe() {
    requestLocation();
  }

  if (coords && filters.latitude !== coords.latitude) {
    setFilters((f) => ({ ...f, latitude: coords.latitude, longitude: coords.longitude, radiusKm: 10, page: 1 }));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">Find a Local Worker</h1>
          <p className="mt-1 text-sm text-ink-500">
            Verified electricians, mechanics, cooks &amp; more — near you.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNearMe}
            disabled={locLoading}
            className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
          >
            <LocateFixed size={16} /> {locLoading ? "Locating…" : "Near me"}
          </button>
          <div className="flex rounded-xl border border-ink-200 p-1">
            <button
              onClick={() => setView("LIST")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${
                view === "LIST" ? "bg-brand-500 text-white" : "text-ink-600"
              }`}
            >
              <List size={14} /> List
            </button>
            <button
              onClick={() => setView("MAP")}
              disabled={!filters.latitude}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm disabled:opacity-40 ${
                view === "MAP" ? "bg-brand-500 text-white" : "text-ink-600"
              }`}
            >
              <MapIcon size={14} /> Map
            </button>
          </div>
        </div>
      </div>

      {trustedWorkers && trustedWorkers.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-sm font-semibold text-ink-700">Your Trusted Workers</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {trustedWorkers.map((entry) => (
              <div key={entry.worker._id} className="relative">
                <WorkerCard worker={entry.worker} />
                <span className="absolute right-3 top-3 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
                  Hired {entry.jobsCompletedWithThisWorker}×
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <WorkerFilterSidebar filters={filters} onChange={setFilters} />

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-52" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="We couldn't load workers"
              description="Please check your connection and try again."
              onRetry={() => refetch()}
            />
          ) : data && data.workers.length > 0 ? (
            view === "MAP" && filters.latitude ? (
              <WorkerMapView workers={data.workers} centerLat={filters.latitude} centerLng={filters.longitude!} />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {data.workers.map((w) => (
                    <div key={w._id}>
                      <WorkerCard worker={w} />
                      {w.distanceKm !== undefined && (
                        <p className="mt-1 text-center text-xs text-ink-400">{w.distanceKm} km away</p>
                      )}
                    </div>
                  ))}
                </div>
                {data.meta.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      disabled={(filters.page ?? 1) <= 1}
                      onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                      className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-ink-500">
                      Page {data.meta.page} of {data.meta.totalPages}
                    </span>
                    <button
                      disabled={(filters.page ?? 1) >= data.meta.totalPages}
                      onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                      className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )
          ) : (
            <EmptyState title="No workers found" description="Try widening your filters." />
          )}
        </div>
      </div>
    </div>
  );
}