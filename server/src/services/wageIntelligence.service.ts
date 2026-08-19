import { WorkerProfile } from "../models/WorkerProfile";
import { Booking } from "../models/Booking";
import mongoose from "mongoose";

interface WageRange {
  p25: number;
  p50: number;
  p75: number;
  sampleSize: number;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "ESTIMATED";
  wageType: "DAILY" | "HOURLY" | "PER_JOB";
}

const MIN_SAMPLE_FOR_LOCAL = 10;
const MIN_SAMPLE_FOR_CITY = 5;

function experienceBracket(years: number): string {
  if (years < 1) return "0-1";
  if (years < 3) return "1-3";
  if (years < 6) return "3-6";
  return "6+";
}

/**
 * Pure percentile aggregation — deliberately NO machine learning, per
 * the product plan's explicit MVP scoping (Part 6: "Do NOT require
 * real ML initially"). Uses actual agreed wages from COMPLETED
 * bookings only (not worker-stated asking wages, which skew high) as
 * the source of truth, since agreedWage on a completed booking is
 * what someone genuinely paid.
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))];
}

/**
 * Three-tier fallback (Part 6): locality-specific -> city-level ->
 * category-level national. Each tier is tried in order; the first
 * with enough data points wins, and the response always says which
 * tier was used so the UI can show "Estimated — limited local data"
 * honestly instead of pretending false precision.
 */
async function getWageEstimate(
  categoryId: string,
  city: string,
  experienceYears: number
): Promise<WageRange | null> {
  const categoryObjectId = new mongoose.Types.ObjectId(categoryId);
  const bracket = experienceBracket(experienceYears);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // Tier 1: category + city + experience bracket, last 90 days.
  const localWages = await fetchWages(categoryObjectId, city, bracket, ninetyDaysAgo);
  if (localWages.length >= MIN_SAMPLE_FOR_LOCAL) {
    return buildRange(localWages, "HIGH");
  }

  // Tier 2: category + city only (drop experience bracket), last 90 days.
  const cityWages = await fetchWages(categoryObjectId, city, null, ninetyDaysAgo);
  if (cityWages.length >= MIN_SAMPLE_FOR_CITY) {
    return buildRange(cityWages, "MEDIUM");
  }

  // Tier 3: category nationwide, no city/experience filter, no date limit.
  const nationalWages = await fetchWages(categoryObjectId, null, null, null);
  if (nationalWages.length >= MIN_SAMPLE_FOR_CITY) {
    return buildRange(nationalWages, "LOW");
  }

  // Not enough data anywhere yet — honest null rather than a fabricated number.
  return null;
}

async function fetchWages(
  categoryId: mongoose.Types.ObjectId,
  city: string | null,
  experienceBracketFilter: string | null,
  since: Date | null
): Promise<{ amount: number; type: string }[]> {
  const match: Record<string, unknown> = {
    category: categoryId,
    status: "COMPLETED",
  };
  if (city) match["location.city"] = new RegExp(`^${escapeRegex(city)}$`, "i");
  if (since) match.createdAt = { $gte: since };

  const bookings = await Booking.find(match)
    .select("agreedWage worker")
    .populate("worker", "experienceYears")
    .lean();

  const filtered = experienceBracketFilter
    ? bookings.filter((b) => {
        const worker = b.worker as unknown as { experienceYears?: number };
        return worker?.experienceYears !== undefined
          ? experienceBracket(worker.experienceYears) === experienceBracketFilter
          : false;
      })
    : bookings;

  // Normalize to daily-equivalent isn't done at MVP — wage types are
  // kept separate; the dominant type in the sample determines what's
  // returned, avoiding mixing hourly and daily figures into one nonsensical range.
  return filtered.map((b) => ({ amount: b.agreedWage.amount, type: b.agreedWage.type }));
}

function buildRange(
  wages: { amount: number; type: string }[],
  confidence: WageRange["confidence"]
): WageRange {
  // Use the most common wage type in this sample so the range is apples-to-apples.
  const typeCounts = new Map<string, number>();
  wages.forEach((w) => typeCounts.set(w.type, (typeCounts.get(w.type) ?? 0) + 1));
  const dominantType = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0][0] as WageRange["wageType"];

  const amounts = wages.filter((w) => w.type === dominantType).map((w) => w.amount).sort((a, b) => a - b);

  return {
    p25: percentile(amounts, 25),
    p50: percentile(amounts, 50),
    p75: percentile(amounts, 75),
    sampleSize: amounts.length,
    confidence,
    wageType: dominantType,
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Used when a worker is SETTING their wage — shown as guidance
 * ("Electricians in Ghaziabad typically charge X-Y") without requiring
 * they have a category+city combo with existing data (falls through
 * the same tier system).
 */
async function getWageGuidanceForWorker(
  categoryId: string,
  city: string,
  experienceYears: number
): Promise<WageRange | null> {
  return getWageEstimate(categoryId, city, experienceYears);
}

export const wageIntelligenceService = { getWageEstimate, getWageGuidanceForWorker };