export interface WorkerCategory {
  _id: string;
  name: string;
  icon?: string;
  parentCategory?: string | null;
}

export interface WageExpectation {
  type: "DAILY" | "HOURLY" | "PER_JOB";
  amount: number;
  currency: string;
}

export type AvailabilityState = "AVAILABLE_NOW" | "AVAILABLE_TODAY" | "BUSY" | "OFFLINE";

export interface WorkerProfile {
  _id: string;
  fullName: string;
  photoUrl?: string;
  bio?: string;
  categories: WorkerCategory[];
  experienceYears: number;
  baseLocation: {
    city: string;
    state?: string;
    geoPoint?: { type: "Point"; coordinates: [number, number] };
  };
  serviceAreaRadiusKm: number;
  wageExpectation: WageExpectation;
  availabilityState: AvailabilityState;
  trustScore: number;
  isNewWorker: boolean;
  completedJobsCount: number;
  averageRating: number;
  ratingCount: number;
  distanceKm?: number;
}

export interface WorkerSearchFilters {
  category?: string;
  city?: string;
  minWage?: number;
  maxWage?: number;
  minRating?: number;
  availableNow?: boolean;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  sort?: "ranked" | "rating_desc" | "wage_asc" | "wage_desc" | "experience_desc" | "distance_asc";
  page?: number;
  limit?: number;
}