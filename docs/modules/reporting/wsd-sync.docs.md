# WSD Sync Guide

End-to-end steps to run a WSD sync locally.

## Prerequisites

- Follow the setup in `README.md` (install deps, copy `.env`, generate Prisma clients if needed).
- PostgreSQL reachable for all three schemas: Reporting, CRM, and WSD (values set in your `.env`).
- Redis running if you use workers (BullMQ).

## Start services

1. API server (dev): `npm run start:dev`
2. Workers:
   - Master worker: `npm run start:worker:master:dev`
   - Batch worker: `npm run start:worker:batch:dev`
   - Need more parallelism? run additional batch worker instances (same command) on different terminals/PM2 processes.

Ensure `REPORTING_API_KEY` (or the header value you configured) exists in your `.env`.

## Trigger a sync

- HTTP endpoint: `POST http://localhost:5000/api/v1/trigger-sync-wsd`
- Header: `reporting-api-key: <your key>`
- You can call it via Swagger UI at `http://localhost:5000/docs/v1` (look for `trigger-sync-wsd`).

The master worker schedules jobs; batch workers process them. Monitor logs to track progress.

## Verify data

- Job status tables: `job_executions`, `reporting_sync_state` (latest runs and state).
- Data tables expected after a successful sync:
  - `wsd_dashboard_summaries`
  - `wsd_domain_activities`
  - `wsd_domain_maps`
  - `wsd_domain_recent_changes`
  - `wsd_domain_registration_trends`
  - `wsd_domain_stats`
