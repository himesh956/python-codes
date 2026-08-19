# LOCALHIRE — Authentication & Authorization

## Flow
1. Register/Login → server issues a short-lived **access token** (JWT,
   15 min) returned in the JSON body, and a longer-lived **refresh
   token** (JWT, 7 days) set as an **httpOnly cookie** scoped to `/api/auth`.
2. The client holds the access token in memory only (React state) and
   attaches it as `Authorization: Bearer <token>` on every request.
3. On page load, the client silently calls `/api/auth/refresh` — the
   httpOnly cookie is sent automatically, and if valid, a new access
   token is issued without the user re-entering credentials.
4. On logout, or on password change, the server clears the stored
   refresh token hash — the cookie becomes worthless even if still present.

## Why httpOnly cookie for the refresh token
An httpOnly cookie can't be read by JavaScript, so it survives an XSS
attack that might steal anything in localStorage or memory. The access
token IS in memory (readable by injected JS in theory), but it expires
in 15 minutes, sharply limiting the damage window.

## Why the refresh token is hashed with SHA-256, not bcrypt
bcrypt silently truncates input over 72 bytes; JWTs are longer. We only
need to prevent someone reading the raw token from a DB dump — the JWT
itself already has full entropy — so a plain digest is correct and safe here.

## RBAC
Every protected route runs `authenticate` (verifies JWT, attaches
`req.user`) then `authorize(...roles)` (checks role membership).
Ownership (e.g. "this job belongs to this employer") is enforced
inside the relevant service function, not just the route middleware —
see `getOwnedJobOrThrow` in `job.service.ts` for the pattern used
throughout the app.