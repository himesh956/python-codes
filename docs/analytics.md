# LOCALHIRE — Analytics

All charts are backed by real MongoDB aggregation pipelines — nothing
is computed or faked in the frontend. See `server/src/services/analytics.service.ts`
for every pipeline, and the table in `docs/api.md` for endpoint paths.

## Key design decisions
- **Application Funnel** counts applications that have *ever* reached
  each stage (via `statusHistory`), not just their current status —
  this is what makes it a funnel rather than a current-state snapshot.
- **Avg CTC** is computed from `salaryMin`/`salaryMax` stored as plain
  numbers (never as a string like "4-7 LPA"), specifically so this
  kind of aggregation is possible without string parsing.
- **Hiring Trends** merges two separate month-grouped aggregations
  (applications, offers) in application code rather than one $facet
  pipeline — simpler to read and fast enough at this data volume.