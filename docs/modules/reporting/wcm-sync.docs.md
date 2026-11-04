# WCM Sync Guide

End-to-end steps to run a WCM sync locally.

## Prerequisites

- Follow the setup in `README.md` (install deps, copy `.env`, generate Prisma clients if needed).
- PostgreSQL reachable for all required schemas (values set in your `.env`).
- Redis running if you use workers (BullMQ).
- Ensure WCM endpoint env is set: `REPORTING_WEBYITH_API_URL` (points to the Webyith API you sync from).

## Start services

1. API server (dev): `npm run start:dev`
2. Workers:
   - Master worker: `npm run start:worker:master:dev`
   - Batch worker: `npm run start:worker:batch:dev`
   - Need more parallelism? run additional batch worker instances (same command) on different terminals/PM2 processes.

Ensure `REPORTING_API_KEY` (or the header value you configured) exists in your `.env`.

## Trigger a sync

- HTTP endpoint: `POST http://localhost:5000/api/v1/trigger-sync-wcm`
- Header: `reporting-api-key: <your key>`
- You can call it via Swagger UI at `http://localhost:5000/docs/v1` (look for `trigger-sync-wcm`).

The master worker schedules jobs; batch workers process them. Monitor logs to track progress.

## Verify data

- Job status tables: `job_executions`, `reporting_sync_state` (latest runs and state).
- Data table expected after a successful sync: `wcm_metrics`
