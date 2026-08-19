# LOCALHIRE — Architecture

## System Flow
Browser (React SPA) → Axios (TanStack Query cache) → REST API (Express) →
Middlewares (helmet, cors, rate-limit, mongo-sanitize, hpp, auth, RBAC,
validation) → Controllers → Services → Mongoose Models → MongoDB Atlas

External services: Cloudinary (resume storage).

## Layered Backend Design
- **routes/** — URL → controller wiring, middleware chaining only.
- **controllers/** — HTTP layer: parse request, call service, shape response. No business logic.
- **services/** — all business logic, ownership checks, DB queries. Framework-agnostic.
- **models/** — Mongoose schemas, indexes, validation at the DB layer.
- **middlewares/** — auth, RBAC, validation, error handling, rate limiting.
- **validators/** — Zod schemas, one per resource.

## Why this separation
Controllers never touch Mongoose directly — every query goes through a
service function. This means:
1. Ownership/authorization logic lives in exactly one place per resource.
2. Services are unit-testable without spinning up Express.
3. Swapping the HTTP framework later would only touch controllers/routes.

## Modular Monolith
LOCALHIRE is one deployable Express app, internally organized into
modules (auth, candidate, employer, job, application, interview,
notification, recommendation, admin, analytics) with clean boundaries —
not microservices. This keeps the system understandable at student-project
scale while still being production-shaped.