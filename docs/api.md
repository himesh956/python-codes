# LOCALHIRE — API Reference

Base URL: `/api`. All responses follow:
```json
{ "success": true, "message": "...", "data": {}, "meta": {} }
```
Errors: `{ "success": false, "message": "...", "errors": [...] }` (errors array only for validation failures).

## Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /register | Public | Register CANDIDATE or EMPLOYER |
| POST | /login | Public | Login, sets refresh cookie |
| POST | /refresh | Public (cookie) | Rotate access token |
| POST | /logout | Required | Invalidate refresh token |
| GET | /me | Required | Current user |
| POST | /change-password | Required | Requires current password |

## Candidates (`/api/candidates`) — CANDIDATE only
GET/PUT `/profile`, POST/DELETE `/resume`

## Employers (`/api/employers`) — EMPLOYER only
GET/PUT `/profile`, PUT `/company`

## Jobs (`/api/jobs`)
GET `/` (public search), GET `/:id`, GET `/employer/mine`, POST `/`,
PUT `/:id`, PATCH `/:id/status` — all employer-owned mutations.

## Applications (`/api/applications`)
POST `/`, GET `/my`, PATCH `/:id/withdraw`, GET `/job/:jobId`,
PATCH `/:id/status`, GET `/:id`.

## Saved Jobs, Notifications, Interviews, Recommendations, Admin, Analytics
Unchanged from LOCALHIRE 2.0 — see git history / earlier docs versions
for full endpoint list.

---

## Worker Categories (`/api/worker-categories`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | / | Public | List active categories |
| POST | / | ADMIN | Create category |
| PATCH | /:id/deactivate | ADMIN | Deactivate category |

## Workers (`/api/workers`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | / | Public | Heavy filter search (category/city/wage/rating/availability/sort) |
| GET | /:id | Public | Worker profile detail |
| GET | /me | Required | My own worker profile |
| PUT | /me | Required | Create/update my worker profile |
| PATCH | /me/availability | Required | Update availability state |

## Bookings (`/api/bookings`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | / | Required | Create a booking request |
| GET | /my/as-customer | Required | My bookings (as customer) |
| GET | /my/as-worker | Required | My bookings (as worker) |
| GET | /:id | Required, owner | Booking detail |
| PATCH | /:id/respond | Required, worker owner | Accept/decline |
| PATCH | /:id/status?as=customer\|worker | Required, owner | Status transition |
| GET | /:bookingId/suggest-next | Required | Suggest next available worker after a decline |

## Reviews (`/api/reviews`)
POST `/` (booking-gated, bidirectional), GET `/worker/:workerId`.

## Verifications (`/api/verifications`)
POST `/` (submit PHONE/GOVT_ID/SKILL_TEST), GET `/worker/:workerId`,
GET `/admin/pending` (ADMIN), PATCH `/admin/:id/review` (ADMIN).

## Wage Intelligence (`/api/wage-intelligence`)
GET `/estimate?categoryId&city&experienceYears` — public, no auth.

## Trusted Workers (`/api/trusted-workers`)
GET `/my` — customer's auto-derived "hired before" list.

## Disputes (`/api/disputes`)
POST `/` (booking participants only), GET `/admin` (ADMIN),
PATCH `/admin/:id/resolve` (ADMIN).

## Fraud Checks (`/api/fraud-checks`) — ADMIN only, investigative
GET `/worker/:workerId`, GET `/user/:userId`.

## Skill Quizzes (`/api/skill-quizzes`)
GET `/category/:categoryId` (public, answers hidden), POST
`/:quizId/attempt` (Required), POST `/` (ADMIN, create).

## Bulk Bookings (`/api/bulk-bookings`) — rate-limited 10/hour
POST `/`, GET `/my`.

## Recurring Bookings (`/api/recurring-bookings`)
POST `/`, GET `/my`, PATCH `/:id/cancel`.

## Worker Analytics (`/api/admin/worker-analytics`) — ADMIN only
GET `/dashboard`, `/category-demand`, `/wage-by-category`,
`/top-rated-workers`, `/category-growth`.