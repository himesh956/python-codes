# LOCALHIRE — Hyperlocal Employment & Skilled-Worker Marketplace

A production-shaped MERN application solving two related problems:
finding local jobs/internships (white-collar), and finding/hiring
verified local skilled workers — electricians, mechanics, cooks,
laborers, and more (blue-collar). Built as a portfolio-grade project
around a genuine product thesis, not a feature checklist.

## Problem

Trust and availability — not discovery — are what actually block
hyperlocal hiring in India. LOCALHIRE makes informal, word-of-mouth
trust portable and verifiable, and answers "who can come right now"
instead of just "who's interested."

## Two Marketplaces, One Platform

**Job Portal:** Candidates, Employers, Jobs, Applications, Interviews,
an explainable recommendation engine, Admin moderation, and a 10-chart
analytics dashboard.

**Worker Marketplace:** Any user can become a Worker (electrician,
mechanic, cook, etc.) or a Customer. Features:
- Heavy filter search (category, wage, rating, availability, distance)
- A **Trust Score** (not a raw star average) — Bayesian-adjusted
  rating, log-scaled job count, recency-weighted reliability,
  verification tiers
- Fair ranking with guaranteed **exploration slots** for new workers
- **Wage Intelligence** — real percentile-based market rate estimates
- **Availability-first hiring** with urgent-request timers and
  auto-suggest-next-worker
- Repeat-hire ("Trusted Workers"), bulk/business hiring, recurring bookings
- A **Dispute** system and rule-based fraud flagging
- Hindi/English UI toggle
- A second, worker-marketplace-specific analytics dashboard

See `docs/worker-marketplace.md` for the full design rationale.

## Tech Stack
**Frontend:** React, Vite, TypeScript, Tailwind CSS, TanStack Query,
React Router, Recharts, react-i18next, React Hook Form, Zod
**Backend:** Node.js, Express, TypeScript, MongoDB + Mongoose, JWT,
bcrypt, Multer + Cloudinary, Zod, Helmet, express-mongo-sanitize, hpp

## Project Structure