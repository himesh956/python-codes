import { FilterQuery } from "mongoose";
import { WorkerProfile, IWorkerProfile } from "../models/WorkerProfile";
import { AppError } from "../utils/AppError";
import {
  UpsertWorkerProfileInput,
  WorkerSearchQuery,
} from "../validators/worker.validators";
import { AvailabilityState } from "../constants/workerEnums";

interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Rounds coordinates to ~110m precision (4 decimal places) before
 * storing — enough for "2.3 km away" distance display and locality-
 * level map placement, but deliberately NOT exact-address precision.
 */
function approximateCoordinates(
  lat: number,
  lng: number
): [number, number] {
  const round = (n: number) => Math.round(n * 10000) / 10000;

  // GeoJSON order: [longitude, latitude]
  return [round(lng), round(lat)];
}

async function upsertMyProfile(
  userId: string,
  input: UpsertWorkerProfileInput
): Promise<IWorkerProfile> {
  const existing = await WorkerProfile.findOne({ user: userId });

  const baseLocationUpdate = input.baseLocation
    ? {
        city: input.baseLocation.city,
        state: input.baseLocation.state,
        country: input.baseLocation.country,
        pincode: input.baseLocation.pincode,

        ...(input.baseLocation.latitude !== undefined &&
        input.baseLocation.longitude !== undefined
          ? {
              geoPoint: {
                type: "Point" as const,
                coordinates: approximateCoordinates(
                  input.baseLocation.latitude,
                  input.baseLocation.longitude
                ),
              },
            }
          : {}),
      }
    : undefined;

  if (existing) {
    Object.assign(existing, {
      ...input,
      baseLocation:
        baseLocationUpdate ?? existing.baseLocation,

      wageExpectation: input.wageExpectation
        ? {
            ...existing.wageExpectation,
            ...input.wageExpectation,
          }
        : existing.wageExpectation,
    });

    await existing.save();

    return existing;
  }

  if (
    !input.fullName ||
    !input.categories ||
    !input.baseLocation ||
    !input.wageExpectation
  ) {
    throw AppError.badRequest(
      "fullName, categories, baseLocation, and wageExpectation are required to create a worker profile"
    );
  }

  return WorkerProfile.create({
    user: userId,
    fullName: input.fullName,
    phone: input.phone,
    bio: input.bio,
    categories: input.categories,
    experienceYears: input.experienceYears ?? 0,

    baseLocation: baseLocationUpdate,

    serviceAreaRadiusKm:
      input.serviceAreaRadiusKm ?? 5,

    wageExpectation: {
      ...input.wageExpectation,
      currency: "INR",
    },
  });
}
async function getMyProfile(
  userId: string
): Promise<IWorkerProfile> {
  const profile = await WorkerProfile.findOne({
    user: userId,
  }).populate("categories", "name icon");

  if (!profile) {
    throw AppError.notFound("Worker profile not found");
  }

  return profile;
}

async function getById(
  workerId: string
): Promise<IWorkerProfile> {
  const profile = await WorkerProfile.findById(workerId).populate(
    "categories",
    "name icon"
  );

  if (!profile) {
    throw AppError.notFound("Worker not found");
  }

  return profile;
}

async function updateAvailability(
  userId: string,
  availabilityState: AvailabilityState
): Promise<IWorkerProfile> {
  const profile = await WorkerProfile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        availabilityState,
        availabilityUpdatedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!profile) {
    throw AppError.notFound("Worker profile not found");
  }

  return profile;
}

function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

/**
 * Worker search:
 *
 * - If latitude + longitude are provided:
 *   Uses MongoDB $nearSphere to find workers within radiusKm.
 *   Results are returned nearest-first.
 *
 * - If coordinates are not provided:
 *   Falls back to city-based + trust-score ranking.
 */
async function search(
  query: WorkerSearchQuery
): Promise<
  PaginatedResult<IWorkerProfile & { distanceKm?: number }>
> {
  const filter: FilterQuery<IWorkerProfile> = {};

  if (query.category) {
    filter.categories = query.category;
  }

  if (!query.latitude && query.city) {
    filter["baseLocation.city"] = new RegExp(
      `^${escapeRegex(query.city)}$`,
      "i"
    );
  }

  if (query.minRating !== undefined) {
    filter.averageRating = {
      $gte: query.minRating,
    };
  }

  if (query.minTrustScore !== undefined) {
    filter.trustScore = {
      $gte: query.minTrustScore,
    };
  }

  if (query.availableNow) {
    filter.availabilityState = "AVAILABLE_NOW";
  }

  if (
    query.minWage !== undefined ||
    query.maxWage !== undefined
  ) {
    filter["wageExpectation.amount"] = {};

    if (query.minWage !== undefined) {
      (
        filter["wageExpectation.amount"] as Record<
          string,
          number
        >
      ).$gte = query.minWage;
    }

    if (query.maxWage !== undefined) {
      (
        filter["wageExpectation.amount"] as Record<
          string,
          number
        >
      ).$lte = query.maxWage;
    }
  }

  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  /*
   * GEO SEARCH
   */
  if (
    query.latitude !== undefined &&
    query.longitude !== undefined
  ) {
    filter["baseLocation.geoPoint"] = {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [
            query.longitude,
            query.latitude,
          ],
        },
        $maxDistance: query.radiusKm * 1000,
      },
    };

    /*
     * $nearSphere gives nearest-first ordering.
     * For total count we use $geoWithin separately.
     */
    const countFilter = { ...filter };

    delete countFilter["baseLocation.geoPoint"];

    countFilter["baseLocation.geoPoint"] = {
      $geoWithin: {
        $centerSphere: [
          [query.longitude, query.latitude],
          query.radiusKm / 6371,
        ],
      },
    };

    const [items, total] = await Promise.all([
      WorkerProfile.find(filter)
        .skip(skip)
        .limit(limit)
        .populate("categories", "name icon"),

      WorkerProfile.countDocuments(countFilter),
    ]);

    const withDistance = items.map((worker) => {
      const coords =
        worker.baseLocation.geoPoint?.coordinates;

      const distanceKm = coords
        ? Math.round(
            haversineDistanceKm(
              query.latitude!,
              query.longitude!,
              coords[1],
              coords[0]
            ) * 10
          ) / 10
        : undefined;

      return Object.assign(worker.toObject(), {
        distanceKm,
      });
    });

    return {
      items:
        withDistance as (
          IWorkerProfile & {
            distanceKm?: number;
          }
        )[],

      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(
          1,
          Math.ceil(total / limit)
        ),
      },
    };
  }

  /*
   * NORMAL / NON-GEO SEARCH
   */
  const sort = resolveSort(query.sort);

  const explorationSlots = Math.max(
    1,
    Math.floor(limit * 0.15)
  );

  const mainSlots = limit - explorationSlots;

  const [
    mainResults,
    explorationResults,
    total,
  ] = await Promise.all([
    WorkerProfile.find({
      ...filter,
      isNewWorker: false,
    })
      .sort(sort)
      .skip(skip)
      .limit(mainSlots)
      .populate("categories", "name icon"),

    page === 1
      ? WorkerProfile.find({
          ...filter,
          isNewWorker: true,
        })
          .sort({ createdAt: -1 })
          .limit(explorationSlots)
          .populate("categories", "name icon")
      : Promise.resolve([]),

    WorkerProfile.countDocuments(filter),
  ]);

  const items = interleave(
    mainResults,
    explorationResults
  );

  return {
    items,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(
        1,
        Math.ceil(total / limit)
      ),
    },
  };
}

function interleave<T>(
  main: T[],
  exploration: T[]
): T[] {
  if (exploration.length === 0) {
    return main;
  }

  const result: T[] = [...main];

  exploration.forEach((item, i) => {
    const insertAt = Math.min(
      result.length,
      (i + 1) * 3
    );

    result.splice(insertAt, 0, item);
  });

  return result;
}

function resolveSort(
  sort?: WorkerSearchQuery["sort"]
): Record<string, 1 | -1> {
  switch (sort) {
    case "rating_desc":
      return {
        averageRating: -1,
      };

    case "wage_asc":
      return {
        "wageExpectation.amount": 1,
      };

    case "wage_desc":
      return {
        "wageExpectation.amount": -1,
      };

    case "experience_desc":
      return {
        experienceYears: -1,
      };

    case "ranked":
    default:
      return {
        trustScore: -1,
        averageRating: -1,
      };
  }
}

function escapeRegex(value: string): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

export const workerService = {
  upsertMyProfile,
  getMyProfile,
  getById,
  updateAvailability,
  search,
};