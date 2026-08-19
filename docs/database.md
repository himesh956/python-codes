# LOCALHIRE — Database Schema

MongoDB Atlas, accessed via Mongoose. See inline comments in each model
file under `server/src/models/` for the authoritative "why this exists"
explanation. Summary:

| Collection | Purpose | Key Indexes |
|---|---|---|
| users | Auth identity for all roles | `email` (unique), `role` |
| candidateProfiles | Candidate-specific profile data | `user` (unique), `skills`, `preferredLocations.city` |
| employerProfiles | Links a User to a Company | `user` (unique), `company` |
| companies | Employer's company/organization | `name` (text) |
| resumes | Resume file metadata (Cloudinary-backed) | `candidate` + `createdAt` |
| jobs | Job listings | `title+description` (text), `status+location.city+createdAt`, `skills`, `salaryMin+salaryMax`, `employer+status` |
| applications | Candidate ↔ Job join + hiring pipeline | `candidate+job` (unique), `candidate+createdAt`, `job+status`, `status+createdAt` |
| savedJobs | Candidate's bookmarked jobs | `candidate+job` (unique) |
| notifications | In-app notifications | `recipient+isRead+createdAt` |
| interviews | Scheduled interviews per application | `candidate+scheduledDate`, `application` |
| skills | Normalized master skill list | `name` (unique) |
| auditLogs | Admin action trail (append-only) | `actor+createdAt`, `targetType+targetId` |

## Why the compound unique indexes matter
`applications` and `savedJobs` both have a compound unique index on
`(candidate, job)`. This is the actual guarantee against duplicates —
application-layer pre-checks are a UX nicety, but only the DB index is
safe under concurrent requests.