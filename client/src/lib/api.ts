import axios from "axios";

/**
 * Single Axios instance used by every feature's service module
 * (e.g. features/jobs/services/jobs.api.ts). Centralizing this now
 * means auth headers / interceptors added in Phase 4 only need to
 * be wired up in one place.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api",
  withCredentials: true,
});
