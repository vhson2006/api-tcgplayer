# CRM → WSD Domain Sync Logic

Business-logic reference for how CRM `customer_domain` rows get reconciled into WSD's
`customer_domain` table. This document explains **what the sync decides and why**; see
[wsd-sync.docs.md](./wsd-sync.docs.md) for how to run sync-related flows locally, or
[crm-domain-sync-explained.docs.md](./crm-domain-sync-explained.docs.md) for a non-technical,
PM-friendly version of this same logic.

Source of truth: `src/modules/crm/sync/crm-sync.service.ts` (`CrmSyncService._syncDomains`).

## Entry point

- `POST /api/v1/sync/domain-crm-to-wsd` (CRM API) → `CrmSyncService.syncDomainCrmToWsd()`.
- Runs synchronously (not queued) so the caller (Internal Portal) can show a loading state for
  the duration of the request.
- Every run is recorded as a row in CRM's `job_executions` table (`status`: `RUNNING` →
  `SUCCESS`/`FAILED`), with the full breakdown below stored as JSON in `metadata`
  (`syncSuccessDomains`, `notSyncSuccessDomains`, `disabledDomainsInWsd`) - this is what backs the
  "Sync Run Detail" history view in the Internal Portal.

## Key context: a domain can belong to multiple customers

CRM's `customer_domain` table has one row **per (customer, domain) pair** - the same domain
string (e.g. `example.com`) can appear multiple times, once per customer that owns it, each with
its own independent `capability_wsd`, `delete_flag`, `is_active`, `delete_at` values.

WSD's `customer_domain` table has **no concept of customer ownership** - one row per domain
name, period. So whenever a domain is shared by more than one CRM customer, the sync must
**merge** those customers' individual settings into a single WSD state. The sync does this by:

1. Grouping all CRM rows by domain name (trimmed, lowercased) first.
2. Deciding **presence** (does this domain get a WSD row at all) from the group as a whole.
3. Deciding **active/deleted state** from a specific subset of the group (see cases below) -
   never from a single row in isolation.

## Step 1 — Presence: does the domain sync at all?

For each domain, take `capableRows` = the owning-customer rows where `capability_wsd = true`.

> **The only reason a domain does not sync is that not a single one of its owning customers has
> WSD capability enabled.** It does not matter how many customers own the domain, whether any of
> them is inactive, or whether any of them has marked it for deletion - as long as **at least
> one** owner has `capability_wsd = true`, the domain is eligible and moves on to Step 2.

## Step 2 — Cases and what happens on sync

### Case 1 — No owner has `capability_wsd = true`

*Condition:* `capableRows.length === 0` (every customer that owns this domain has WSD capability
switched off).

*On sync:*
- The domain is **not** treated as present. No new WSD row is ever created for it.
- If a WSD row **already exists** for this domain (e.g. it was capability-enabled before and got
  disabled since), it is updated: `is_active = false`, `is_deleted = true`.
- `deleted_at` mirrors the **max `delete_at`** across **all** owning customers of the domain
  (regardless of their capability flag - capability doesn't matter here since none of them are
  capable anyway). If **none** of the owners ever recorded a `delete_at`, it falls back to
  **now + 2 months** instead of being left `null`.
- If the domain has no WSD row yet, this is a no-op (nothing to update).
- Reported in sync stats as `notSyncSuccessDomains`, one entry per owning customer, with reason
  `"capabilityWsd is false - domain is not eligible for WSD sync"`.

### Case 2 — At least one capability-enabled owner, and every one of them has deleted the domain

*Condition:* `capableRows.length > 0`, and every row in `capableRows` has `delete_flag = true`
(i.e. `nonDeletedCapableRows.length === 0`). Owners without capability are ignored entirely for
this decision, even if they haven't deleted the domain.

*On sync:*
- The domain **is** present/synced (upserted into WSD).
- `is_deleted = true`, `is_active = false`.
- `deleted_at` mirrors the **max `delete_at`** across only the **capability-enabled** owners
  (not all owners) - consistent with CRM instead of an independently computed date.
- Reported in sync stats as `syncSuccessDomains` (it's still a "success" - capability being on is
  the only pass/fail condition, this domain is just synced in a deleted state).

### Case 3 — At least one capability-enabled owner has *not* deleted the domain, and at least one of those is active

*Condition:* `capableRows.length > 0`, `nonDeletedCapableRows.length > 0` (at least one
capability-enabled owner has `delete_flag = false`), and at least one row in
`nonDeletedCapableRows` has `is_active = true`.

*On sync:*
- The domain is present/synced, **not deleted**: `is_deleted = false`, `deleted_at = null`.
- `is_active = true` (OR across the capability-enabled, non-deleted owners - just one of them
  being active is enough).

### Case 4 — At least one capability-enabled owner has *not* deleted the domain, but all of those are inactive

*Condition:* same as Case 3 except every row in `nonDeletedCapableRows` has `is_active = false`.

*On sync:*
- The domain is present/synced, **not deleted**: `is_deleted = false`, `deleted_at = null`.
- `is_active = false` (every capability-enabled, non-deleted owner has toggled the domain off,
  but none of them has actually delete-flagged it).

> Cases 3 and 4 both keep the domain present and un-deleted; a domain toggled inactive
> (`is_active = false`) in CRM is **not** the same as being deleted - `is_deleted` only ever
> becomes `true` via Case 2 (every capability-enabled owner delete-flagged it) or Case 1 (no
> capability-enabled owner at all).

### Cases 2–4 upsert behavior

For any domain that reaches Step 2 (i.e. not Case 1), the sync `upsert`s the WSD row:
- **Doesn't exist yet** → created with `is_first_run = true`, `priority = 1`,
  `created_by = 'CRM-SYNC'`, plus the computed `is_active`/`is_deleted`/`deleted_at`.
- **Already exists** → updated with the computed `is_active`/`is_deleted`/`deleted_at`, and also
  clears `is_disable = false`, `deleted_by = null`, `deletion_reason = null` (so a domain that was
  previously flagged `is_disable` because it briefly vanished from CRM comes back clean once it's
  eligible again).

Reported in sync stats as `syncSuccessDomains`, one entry per **distinct domain** (not per
customer), each carrying a `customers` array listing **every** CRM customer that owns that
domain - including non-capability owners - so the UI can show full ownership context even though
only the capability-enabled owners influenced the computed state.

## Step 3 — Domains removed from CRM entirely (a separate, third case)

This is independent of Steps 1–2 and only applies to a domain that has **zero** CRM
`customer_domain` rows left at all (not even a capability-off one) - i.e. no customer references
it anymore.

*Condition:* a WSD row exists, `is_disable` is not already `true`, and the domain name has no
entry in the CRM group map at all.

*On sync:*
- `is_disable = true`.
- `is_active`, `is_deleted`, `deleted_at`, `deleted_by`, `deletion_reason` are all reset to a
  neutral/clean state (`false`/`false`/`null`/`null`/`null`) - not just left as they were - so
  that if the domain is ever re-added to CRM later, it starts from a clean slate instead of
  carrying stale deletion state from before it was removed.
- Reported in sync stats as `disabledDomainsInWsd`.

This is distinct from Case 1: Case 1 is "the domain still exists in CRM, but nobody has WSD
capability on it"; Step 3 is "the domain doesn't exist in CRM for anybody anymore."

## Case summary table

| # | Domain still in CRM? | Capability-enabled owners | Of those, non-deleted owners | Of those, any active? | `is_active` | `is_deleted` | `is_disable` | `deleted_at` |
|---|---|---|---|---|---|---|---|---|
| 1 | yes | none | – | – | `false` | `true` | unchanged | max `delete_at` across **all** owners, else now+2mo |
| 2 | yes | ≥1 | none (all deleted) | – | `false` | `true` | unchanged | max `delete_at` across **capability-enabled** owners |
| 3 | yes | ≥1 | ≥1 | yes | `true` | `false` | unchanged | `null` |
| 4 | yes | ≥1 | ≥1 | no | `false` | `false` | unchanged | `null` |
| 5 | no (removed entirely) | – | – | – | `false` | `false` | `true` | `null` |

Row 1 only *updates* an existing WSD row (never creates one); rows 2–4 create-or-update
(`upsert`); row 5 only updates existing, non-`is_disable`d WSD rows.

## Where this shows up in the API/UI

- `POST /api/v1/sync/domain-crm-to-wsd` response `data.stats` - the three buckets above
  (`syncSuccessDomains`, `notSyncSuccessDomains`, `disabledDomainsInWsd`).
- Persisted as `job_executions.metadata` for that run, surfaced in the Internal Portal's "Sync
  History" list and "Sync Run Detail" modal (Successful Domains / Failed Domains tabs).
