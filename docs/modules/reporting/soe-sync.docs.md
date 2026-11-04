# SOE Sync Guide

End-to-end steps to run a SOE sync locally.

The SOE sync reads probe results from the SOE database (`soe_results`) and writes one summary row per monitored site per time bucket into the Reporting database (`soe_summary`). It runs every hour by default.

## Prerequisites

- Follow the setup in `README.md` (install deps, copy `.env`, generate Prisma clients if needed).
- PostgreSQL reachable for the Reporting, CRM, and SOE databases (values set in your `.env`).
- Redis running if you use workers (BullMQ).
- Ensure the SOE env vars are set:
  - `POSTGRES_SOE_DATABASE_URL` (read-only source of `soe_results`)
  - `SOE_SYNC_CRON` (default `0 * * * *`, every hour)
  - `SOE_SYNC_BATCH_SIZE` (default `2000`; number of site/bucket pairs per batch job)

### Database access

| Database  | Table                                         | Access                     |
| --------- | --------------------------------------------- | -------------------------- |
| SOE       | `soe_results`                                 | `SELECT`                   |
| CRM       | `soe_monitored_sites`, `http_status_meanings` | `SELECT`                   |
| Reporting | `soe_summary`                                 | `SELECT`, `INSERT`, `UPDATE` |

`soe_summary` needs a unique constraint on `(site_id, collected_at_utc)`. The upsert uses it as its conflict target and fails without it. Apply it manually on each environment; do not run `prisma migrate dev` against a shared database.

## Start services

1. API server (dev): `npm run start:dev`
2. Workers:
   - Master worker: `npm run start:worker:master:dev` (also runs the `SOE_SYNC_CRON` schedule)
   - Batch worker: `npm run start:worker:batch:dev`
   - Need more parallelism? run additional batch worker instances (same command) on different terminals/PM2 processes.

Ensure `REPORTING_API_KEY` (or the header value you configured) exists in your `.env`.

## Trigger a sync

- HTTP endpoint: `GET http://localhost:5000/api/v1/sync/trigger-sync-soe`
- Header: `reporting-api-key: <your key>`
- You can call it via Swagger UI at `http://localhost:5000/api/docs/v1` (look for `trigger-sync-soe`).

Without a manual trigger, the master worker starts a sync on the `SOE_SYNC_CRON` schedule. The master worker schedules jobs; batch workers process them. Monitor logs to track progress.

## How rows are built

- **Which results are picked up:** rows in `soe_results` whose `received_at_utc` is newer than the last successful sync. Every bucket those rows fall into is recalculated in full, so late results are handled.
- **Bucket length:** per site, from `soe_monitored_sites.frequency_minutes` in CRM. Buckets are aligned to UTC.
- **Skipped sites:** sites missing from CRM or marked `DELETED`.
- **One row per site per bucket**, combining every agent's results:
  - `collected_at_utc` is the bucket start.
  - `status` is `DOWN` if any probe in the bucket is down; `status_code` comes from the worst probe.
  - `max_*` columns are the maximum across probes.
  - `avg_http_latency_ms` averages only probes with an HTTP status code; `avg_latency_ms` and `avg_jitter_ms` average all probes.

## Verify data

- Job status tables: `job_executions`, `reporting_sync_state` (latest runs and state).
- Data table expected after a successful sync: `soe_summary`
- Read API (Reporting):
  - `POST /api/v1/soe-summary/latest`: newest row per site
  - `POST /api/v1/soe-summary/list`: history, filter by `siteIds`, `from` (inclusive), `to` (exclusive), `status`
