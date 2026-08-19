import { useQuery } from "@tanstack/react-query";
import { listCategories } from "@/features/workers/api/workers.api";
import { WorkerSearchFilters } from "@/features/workers/types";

interface Props {
  filters: WorkerSearchFilters;
  onChange: (filters: WorkerSearchFilters) => void;
}

/**
 * The "heavy filter system" — the original core ask. Every filter
 * updates the parent's state directly; no local "apply" button, since
 * instant feedback matters more than form ceremony for this kind of search.
 */
export function WorkerFilterSidebar({ filters, onChange }: Props) {
  const { data: categories } = useQuery({ queryKey: ["worker-categories"], queryFn: listCategories });

  function set<K extends keyof WorkerSearchFilters>(key: K, value: WorkerSearchFilters[K]) {
    onChange({ ...filters, [key]: value, page: 1 });
  }

  return (
    <div className="w-full space-y-5 rounded-2xl border border-ink-100 bg-white p-4 lg:w-64">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400">Category</label>
        <select
          value={filters.category ?? ""}
          onChange={(e) => set("category", e.target.value || undefined)}
          className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400">City</label>
        <input
          value={filters.city ?? ""}
          onChange={(e) => set("city", e.target.value || undefined)}
          placeholder="e.g. Ghaziabad"
          className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400">Wage range (₹)</label>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minWage ?? ""}
            onChange={(e) => set("minWage", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxWage ?? ""}
            onChange={(e) => set("maxWage", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400">Minimum rating</label>
        <div className="mt-2 flex gap-1.5">
          {[3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => set("minRating", filters.minRating === r ? undefined : r)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                filters.minRating === r
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-ink-200 text-ink-600"
              }`}
            >
              {r}+ ★
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={filters.availableNow ?? false}
          onChange={(e) => set("availableNow", e.target.checked || undefined)}
          className="h-4 w-4 rounded border-ink-300 text-brand-600"
        />
        Available now only
      </label>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400">Sort by</label>
        <select
          value={filters.sort ?? "ranked"}
          onChange={(e) => set("sort", e.target.value as WorkerSearchFilters["sort"])}
          className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
        >
          <option value="ranked">Recommended</option>
          <option value="rating_desc">Highest rated</option>
          <option value="wage_asc">Lowest wage</option>
          <option value="wage_desc">Highest wage</option>
          <option value="experience_desc">Most experienced</option>
        </select>
      </div>
    </div>
  );
}