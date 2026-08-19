# LOCALHIRE 3.0 — Worker Marketplace

This document covers everything added on top of the original
white-collar job portal (see `architecture.md`, `database.md`, `api.md`
for that side, which is unchanged).

## Core Concept

A second, inverted-flow marketplace: instead of a candidate applying
to a pre-posted job, a **customer books a specific worker directly**.
Workers (electricians, mechanics, cooks, laborers, etc.) set their own
wage, availability, and service area; customers search/filter and send
a booking request.

Any existing CANDIDATE or EMPLOYER user can *also* become a worker or
a customer — these are capabilities layered on the existing role
system, not new roles. See `WorkerProfile.user` — one User can have
both a CandidateProfile/EmployerProfile AND a WorkerProfile.

## Trust Score (not a raw star rating)

Computed in `trustScore.service.ts`, weighted across:
- Verification (phone/govt-ID/skill-test) — 15 pts
- Bayesian-adjusted rating — 20 pts (blends worker's own average with
  platform average, weighted by review count — prevents "5 stars from
  1 review" outranking a proven track record)
- Log-scaled completed jobs — 20 pts (10th job matters far more than
  100th — diminishing returns by design)
- 90-day recency-weighted reliability — 10 pts
- Penalties (cancellations, disputes) — up to -20 pts

New workers (zero completed jobs) get a flat baseline score (20 +
verification points) rather than being scored against the full
formula — shown in the UI as "New · Verified," never as a low number
next to established workers.

Full history is preserved in `TrustScoreSnapshot` (append-only) so
"why did my score change" is always answerable.

## Fair Ranking (Exploration Slots)

Search results reserve ~15% of each first page for new/low-history
verified workers, interleaved into the results (not dumped on page 2)
— see `worker.service.ts` `search()` → `interleave()`. This prevents
the classic marketplace failure mode where established workers
permanently dominate and new supply never gets a chance.

**Known MVP simplification:** ranking uses trustScore + rating
composite, not full distance-decay weighted scoring — there's no
lat/lng field in the schema yet. Documented as a V1 refinement.

## Wage Intelligence

Pure percentile aggregation (`wageIntelligence.service.ts`) — no ML.
Three-tier fallback: category+city+experience → category+city →
category nationwide. Sourced from actual `agreedWage` on COMPLETED
bookings (not worker-stated asking prices, which skew high). Always
labels its confidence level honestly (HIGH/MEDIUM/LOW).

## Booking Lifecycle

`REQUESTED → ACCEPTED/DECLINED → IN_PROGRESS → COMPLETED → (DISPUTED)`

Role-gated transitions (`CUSTOMER_ALLOWED` / `WORKER_ALLOWED` maps in
`booking.service.ts`) — a customer can never mark their own booking
COMPLETED, only the worker can.

Urgent bookings get a `respondBy` deadline (10 min); a background
sweeper (`jobs/urgentBookingSweeper.ts`, runs every 60s) auto-expires
unanswered urgent requests and offers the customer an auto-suggested
next available worker.

## Bulk & Recurring Hiring

`BulkBookingRequest` fans out individual `Booking` documents to the
top-N available workers in a category/city — reuses the entire
existing booking lifecycle rather than inventing a parallel one.
`RecurringBookingSchedule` generates real Bookings on a due-date sweep
(hourly job, `jobs/recurringBookingGenerator.ts`).

## Disputes

Simple by design (Part 13 of the product plan identified this as a
missing piece): reason + evidence URLs (Cloudinary only) + admin text
resolution. No in-app chat/messaging — deferred to V2. Filing a
dispute flips the booking to DISPUTED and triggers a trust-score
recompute; resolving it lifts the associated penalty.

## Fraud Detection

Rule-based only (`fraudDetection.service.ts`) — review-velocity
anomalies, booking-request spam, suspicious email patterns. Surfaced
to admins as investigative flags, never used for auto-banning. ML-based
detection is explicitly deferred to V2 pending real labeled data.

## What's Deliberately NOT Built (per the product plan)

- Payment/escrow processing
- In-app chat (contact is phone-number reveal after booking accepted)
- Full voice-search NLU (voice-to-text exists for form fields; natural-
  language query parsing is V2)
- ML-based fraud/matching
- Worker "follows" social graph