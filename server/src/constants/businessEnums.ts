export const BULK_REQUEST_STATUSES = ["OPEN", "PARTIALLY_FILLED", "FILLED", "CLOSED", "CANCELLED"] as const;
export type BulkRequestStatus = (typeof BULK_REQUEST_STATUSES)[number];

export const RECURRENCE_PATTERNS = ["WEEKLY", "BIWEEKLY", "MONTHLY"] as const;
export type RecurrencePattern = (typeof RECURRENCE_PATTERNS)[number];