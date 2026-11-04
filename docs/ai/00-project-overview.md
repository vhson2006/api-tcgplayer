# 00 — Project Overview

> Source of truth for AI coding agents (GitHub Copilot, Claude Code, and others) working in this repository.
> These `docs/ai/*.md` files are the canonical rules. `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`, and `CLAUDE.md` / `.claude/rules/*.md` all point back here instead of duplicating content.

## What this service is

**Webyith Reporting** is a NestJS backend service that aggregates security/domain reporting data (WCM, WSD, CRM, threat feeds, recommendations) for the Webyith platform. It:

- Syncs data from upstream sources (Webyith API, WSD, WCM) into PostgreSQL via scheduled/triggered jobs.
- Serves aggregated reporting data through a versioned REST API (`/api/v1/...`).
- Runs long-running/background work (sync, scanning, screenshots, retention, backfill) via BullMQ workers, separate from the API process.

## Tech stack

- **Framework:** NestJS 11 (Express platform)
- **Language:** TypeScript (strict-ish, ESLint + Prettier enforced)
- **Database:** PostgreSQL, accessed via **Prisma** — 4 independent schemas/clients: `reporting`, `wsd` (+ `wsd` v2 write client), `crm`, `zendesk`
- **Queues/Jobs:** BullMQ (Redis-backed), multiple queues, multiple worker entrypoints
- **Docs:** Swagger/OpenAPI at `/docs/v1`
- **Validation:** `class-validator` / `class-transformer` (DTOs), Zod (env config)
- **Testing:** Jest (unit, integration, e2e — separate configs)
- **Logging/Errors:** `@webyith-commons/*` packages (`ServerLogger`, `UnifiedHandler`, `ServerErrorAdapter`)

## Entry points

| Entry point | Purpose |
|---|---|
| `src/main.ts` | Main Reporting API (`AppModule`) |
| `src/main-crm.ts` | Separate CRM API (`AppCrmModule`), own port + `crm-api-key` guard |
| `src/workers/master/master-worker.main.ts` | Master worker — schedules/orchestrates jobs |
| `src/workers/batch/batch-worker.main.ts` | Batch worker — processes sync/scan batches |
| `src/workers/screenshot/screenshot-worker.main.ts` | Screenshot capture worker |
| `src/workers/scan-analysis/scan-analysis-worker.main.ts` | Scan analysis worker |
| `src/workers/wsd-domain-scanner/wsd-domain-scanner-worker.main.ts` | WSD domain scanner worker |

Run these via the `npm run start:*:dev` / `start:*:prod` scripts (see [package.json.docs.md](../package.json.docs.md)).

## Key domains / modules (`src/modules/`)

- **wcm** / **wsd** / **wsd-\*** — Web Content Monitoring and Web Security Dashboard reporting (largest domain area; split into `wsd-api`, `wsd-analysis`, `wsd-auth`, `wsd-export`, `wsd-remarks`, `wsd-scanner`, `wsd-scanner-worker`, `wsd-scans`, `wsd-screenshots`)
- **crm** — CRM data reporting
- **sync** — orchestrates data sync jobs from upstream sources into `wcm_metrics` / `wsd_*` tables
- **recommendation** — recommendation scan triggers (BullMQ + duplicate-request middleware)
- **hnrd-scanner** / **hnrd-scanner-worker** — HNRD domain scanning pipeline
- **threats** / **threatfeeds** — threat data
- **service-domain**, **soc**, **presence**, **cloudWAF** — supporting domain data sources
- **keycloak-api** — internal OAuth2 client-credentials auth to other services
- **maintenance** — manual triggers for snapshot retention and partition backfill (see [retention-flows.docs.md](../modules/reporting/retention-flows.docs.md))
- **report-management** — report generation/management
- **health**, **testecho** — infra/health check endpoints (exempt from API key guard)

## Related runbooks (operational docs, not AI rules)

These live in `docs/*.md` and describe **how to operate** specific flows; `docs/ai/*.md` describes **how to write code** in this repo. Read the relevant runbook when the task touches that area:

- [commit-rules.docs.md](../commit-rules.docs.md) — commit message format
- [dev-to-pr-flow.docs.md](../dev-to-pr-flow.docs.md) — local gatekeepers before pushing/merging
- [dto-organization.docs.md](../dto-organization.docs.md) — DTO folder/naming conventions
- [list-api-pagination.docs.md](../list-api-pagination.docs.md) — pagination pattern for list endpoints
- [package.json.docs.md](../package.json.docs.md) — npm script reference
- [testing-flows.md](../testing-flows.md) — how to run unit/integration/e2e tests locally
- [retention-flows.docs.md](../modules/reporting/retention-flows.docs.md) — snapshot retention & partition backfill rollout
- [wcm-sync.docs.md](../modules/reporting/wcm-sync.docs.md) / [wsd-sync.docs.md](../modules/reporting/wsd-sync.docs.md) — triggering syncs locally
- [crm-domain-sync-logic.docs.md](../modules/reporting/crm-domain-sync-logic.docs.md) — CRM→WSD domain sync business logic (multi-customer domains, eligibility/deletion cases); [crm-domain-sync-explained.docs.md](../modules/reporting/crm-domain-sync-explained.docs.md) is the non-technical version
- [api-controller.docs.md](../api-controller.docs.md) — controller decorator/route/Swagger-example conventions

## How to use `docs/ai/*.md`

| File | Covers |
|---|---|
| [01-global-conventions.md](./01-global-conventions.md) | Naming, formatting, commits, dev→PR flow |
| [02-architecture-rules.md](./02-architecture-rules.md) | Module layout, bootstrap pipeline, queues/workers |
| [03-nestjs-rules.md](./03-nestjs-rules.md) | Modules, controllers, guards/interceptors/pipes |
| [04-database-rules.md](./04-database-rules.md) | Prisma multi-schema, repositories, migrations |
| [05-api-rules.md](./05-api-rules.md) | Versioning, response envelope, DTOs, pagination, Swagger |
| [06-error-handling-rules.md](./06-error-handling-rules.md) | Exception filter, error classes, logging on error |
| [07-testing-rules.md](./07-testing-rules.md) | Unit/integration/e2e conventions, mocks, seeds |
| [08-security-rules.md](./08-security-rules.md) | API keys, rate limiting, throttling, secrets |
| [09-code-review-instruction.md](./09-code-review-instruction.md) | Checklist AI agents should apply when reviewing code |
| [10-e2e-test-instruction.md](./10-e2e-test-instruction.md) | Step-by-step for writing/running e2e tests |
| [11-ai-usage-policy.md](./11-ai-usage-policy.md) | What may/may not be shared with AI tools, masking, review of AI output |

