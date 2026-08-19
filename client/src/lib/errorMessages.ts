/**
 * Per Phase 13 of the revised brief: "BAD: ValidationError: ObjectId
 * invalid / GOOD: We couldn't find this job. Please try again."
 *
 * The backend already sends clean messages via AppError (e.g. "Job
 * not found", "You do not have permission..."), so most of the time
 * the raw API message is already fine to show directly. This utility
 * exists as the SINGLE place that decides what to show when the API
 * message is missing, generic, or clearly technical (network errors,
 * timeouts, unexpected 500s) — so no component has to guess.
 */
const GENERIC_FALLBACK = "Something went wrong. Please try again.";

const TECHNICAL_PATTERNS = [
  /objectid/i,
  /cast to/i,
  /validation.*failed/i,
  /e11000/i,
  /econnrefused/i,
  /network error/i,
];

export function getFriendlyErrorMessage(err: unknown): string {
  const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
  const status = (err as { response?: { status?: number } })?.response?.status;

  if (!apiMessage) {
    if ((err as { code?: string })?.code === "ERR_NETWORK") {
      return "Can't connect right now. Please check your internet and try again.";
    }
    return GENERIC_FALLBACK;
  }

  const looksTechnical = TECHNICAL_PATTERNS.some((pattern) => pattern.test(apiMessage));
  if (looksTechnical || (status && status >= 500)) {
    return GENERIC_FALLBACK;
  }

  // Server already sends a clean message (AppError-driven) — use it directly.
  return apiMessage;
}