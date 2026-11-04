# Reporting Snapshot Retention and Backfill Flows

This document is the rollout runbook for the parent task:

- [Reporting] - Enhancement - Snapshot data growth causing slow API response

It focuses on execution in real environments (dev/staging/prod), after code is already merged.

## 1. What is already implemented

### API and query performance

- Latest snapshot lookups changed from aggregate max scans to indexed latest-row lookups.
- Supporting indexes added for WCM and WSD read paths.

### Data growth controls

- Snapshot retention policy engine exists (hourly + daily + weekly keep windows).
- Retention can run in dry-run mode first.
- Retention is automatically triggered after successful sync (safe failure handling).

### Ingestion dedupe / delta-like behavior

- Deterministic IDs added for WCM/WSD sync rows.
- Duplicate insert risk reduced significantly.
- skipDuplicates added where applicable.

### Partition rollout foundation

- Shadow table exists: wcm_metrics_partitioned (range partitioned by record_date).
- Partition helper function exists: reporting_ensure_daily_partitions(...).
- Backfill helper function exists: reporting_backfill_wcm_metrics_partitioned(batch_size).

### Operations and automation

- Manual retention trigger endpoint exists.
- Manual one-batch backfill trigger exists.
- Auto backfill scheduler + worker exists (BullMQ repeat job).
- Auto scheduler controls exist (enable / disable / status).
- Auto backfill can stop itself when completed.

## 2. Environment preparation checklist

Before running rollout in an environment:

1. Ensure API service is running.
2. Ensure master worker is running.
3. Ensure Redis and PostgreSQL are healthy.
4. Ensure migration permissions are available.
5. Ensure environment variables are configured.

### Required environment variables

At minimum configure these in .env (or environment secret manager):

- REPORTING_SYNC_MIN_INTERVAL_HOURS
- REPORTING_RETENTION_ENABLED
- REPORTING_RETENTION_DRY_RUN
- REPORTING_RETENTION_KEEP_HOURLY_SNAPSHOTS
- REPORTING_RETENTION_KEEP_DAILY_SNAPSHOTS
- REPORTING_RETENTION_KEEP_WEEKLY_SNAPSHOTS
- REPORTING_RETENTION_PARTITION_PRECREATE_DAYS_AHEAD
- REPORTING_RETENTION_PARTITION_PRECREATE_DAYS_BACK
- REPORTING_PARTITION_BACKFILL_BATCH_SIZE
- REPORTING_PARTITION_BACKFILL_AUTO_ENABLED
- REPORTING_PARTITION_BACKFILL_AUTO_INTERVAL_SECONDS

Reference samples:

- .env.sample
- .env.test.sample

## 3. Rollout sequence (recommended)

## Phase A: Deploy code and migrations

1. Deploy application code.
2. Apply database migrations, including:
   - optimize snapshot query indexes
   - wcm partition shadow migration
3. Restart API + workers.

## Phase B: Safety-first retention dry run

1. Set:
   - REPORTING_RETENTION_ENABLED=true
   - REPORTING_RETENTION_DRY_RUN=true
2. Trigger retention manually:
   - GET /api/v1/maintenance/trigger-snapshot-retention
3. Review affectedRows per table and validate expected data impact.

## Phase C: Execute retention

1. Set:
   - REPORTING_RETENTION_DRY_RUN=false
2. Trigger retention again, or let post-sync automation execute it.
3. Verify:
   - API latency improves
   - table growth trend slows

## Phase D: WCM shadow backfill

Option 1: Manual batches

- Repeatedly call:
  - GET /api/v1/maintenance/trigger-wcm-partition-backfill
- Continue until completed=true.

Option 2: Automatic scheduler (recommended)

1. Set:
   - REPORTING_PARTITION_BACKFILL_AUTO_ENABLED=true
   - REPORTING_PARTITION_BACKFILL_AUTO_INTERVAL_SECONDS=300 (example)
2. Enable scheduler (if needed):
   - GET /api/v1/maintenance/trigger-wcm-partition-backfill-auto-enable
3. Monitor status:
   - GET /api/v1/maintenance/wcm-partition-backfill-auto-status
4. Disable manually if needed:
   - GET /api/v1/maintenance/trigger-wcm-partition-backfill-auto-disable

## Phase D.1: WSD shadow backfill

Option 1: Manual batches

- Repeatedly call:
  - GET /api/v1/maintenance/trigger-wsd-partition-backfill
- Continue until completed=true.

Option 2: Automatic scheduler (recommended)

1. Set:
   - REPORTING_PARTITION_BACKFILL_AUTO_ENABLED=true
   - REPORTING_PARTITION_BACKFILL_AUTO_INTERVAL_SECONDS=300 (example)
2. Enable scheduler (if needed):
   - GET /api/v1/maintenance/trigger-wsd-partition-backfill-auto-enable
3. Monitor status:
   - GET /api/v1/maintenance/wsd-partition-backfill-auto-status
4. Disable manually if needed:
   - GET /api/v1/maintenance/trigger-wsd-partition-backfill-auto-disable

## Phase E: WCM + WSD cutover to partitioned tables

After both WCM and WSD shadow backfills reach zero remaining rows, run the cutover migration:

- 20260506113000_reporting_partition_cutover

What this migration does:

1. Verifies parity for each source/shadow pair (raises error if missing rows remain).
2. Renames source table to *_legacy.
3. Renames shadow partitioned table to the original source table name.

Covered table pairs:

- wcm_metrics <-> wcm_metrics_partitioned
- wsd_dashboard_summaries <-> wsd_dashboard_summaries_partitioned
- wsd_domain_activities <-> wsd_domain_activities_partitioned
- wsd_domain_maps <-> wsd_domain_maps_partitioned
- wsd_domain_recent_changes <-> wsd_domain_recent_changes_partitioned
- wsd_domain_registration_trends <-> wsd_domain_registration_trends_partitioned
- wsd_domain_stats <-> wsd_domain_stats_partitioned

Result:

- APIs continue using existing table names with no Prisma schema remap required.
- Reads/writes now target partitioned tables under the original names.

## 4. Monitoring and acceptance criteria

Track these signals during rollout:

- API latency (p50/p95/p99) on WCM/WSD endpoints
- DB CPU and IO
- Table row growth rate
- Retention affectedRows trend
- Backfill insertedRows / remainingRows trend
- Queue health (repeat job present, worker consumption)

Completion criteria:

1. Retention runs successfully with expected keep windows.
2. Backfill status returns completed=true.
3. No unexpected API regressions.
4. Snapshot growth slope is controlled.

## 5. Operational commands (examples)

Run app build:

```bash
npm run build
```

Run API locally:

```bash
npm run start:dev
```

Run master worker locally:

```bash
npm run start:worker:master:dev
```

Run batch worker locally:

```bash
npm run start:worker:batch:dev
```

## 6. Rollback and incident handling

If issues appear:

1. Disable auto backfill scheduler immediately.
2. Set REPORTING_RETENTION_ENABLED=false.
3. Keep existing source table (wcm_metrics) as primary data source.
4. Investigate SQL plans and queue pressure before resuming.

Notes:

- Current partition rollout is shadow-mode, so reverting is mainly configuration and scheduler control.
- Do not drop source tables before final cutover and parity validation.

## 7. Post-cutover validation and cleanup

After cutover migration completes:

1. Verify critical APIs and dashboards for WCM and WSD.
2. Monitor query latency and DB load for at least one retention window.
3. Keep *_legacy tables for rollback until confidence window is complete.
4. Plan and execute explicit legacy table cleanup in a later change.
