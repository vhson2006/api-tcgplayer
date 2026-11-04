# 02 — Architecture Rules

> See [00-project-overview.md](./00-project-overview.md) for the full index.

## Layering

```
Controller  → thin, HTTP concerns only (routing, DTO validation, Swagger docs)
Service     → business logic, orchestrates repositories/other services
Repository  → Prisma access for one entity/table (optional layer; simple modules query Prisma directly in the service)
```

Controllers must not call Prisma/other DB clients directly. Put DB access in a service or a `*.repository.ts` class injected into the service.

## Module folder layout

A typical feature module under `src/modules/<feature>/`:

```
<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts        # or several services split by responsibility (see wsd/)
├── dto/ or dtos/
│   └── <entity>.dto.ts
├── docs/                       # optional: Swagger response examples
├── repositories/                # optional: DB access split out of the service
├── worker/                      # optional: BullMQ processors for this feature
├── types/ interfaces/ constants/ utils/  # optional, as needed
```

Modules with multiple resources (e.g. `wsd`) split services per resource (`WsdDashboardSummariesService`, `WsdDomainMapsService`, `WsdDomainStatsService`, ...) rather than one giant service.

Module-level middleware (rare) is wired via `implements NestModule` + `configure(consumer: MiddlewareConsumer)`, scoped to specific routes — see `recommendation.module.ts` (duplicate-request protection on the trigger-scan route).

## Bootstrap pipeline (`src/core/bootstrap/`)

`bootstrapApplication(app, options)` wires, in order:

1. `setupApp` — `helmet`, CORS, `compression`, body size limits, global prefix `api`
2. `setupGraceful` — graceful shutdown
3. `setupRateLimit` — Express rate limiter
4. `setupSwagger` — versioned Swagger docs at `/docs/v1`
5. Global interceptors: `ResponseInterceptor`, `HttpLoggerInterceptor` (order matters — response shaping first, then logging)
6. Global filter: `HttpExceptionFilter`
7. Global pipe: `ValidationPipe({ transform: true })`

Do not re-register these per-module; they are process-wide. If a new cross-cutting concern is needed, add it to `src/core/bootstrap/` rather than importing ad hoc into `main.ts`.

## Multi-app structure

This repo compiles to **multiple runnable entrypoints** from one codebase: the main Reporting API (`AppModule`/`main.ts`), a separate CRM API (`AppCrmModule`/`main-crm.ts`, own API key guard `crm-api-key`), and several standalone workers (`src/workers/*`). When adding a module, be explicit about which app(s) it belongs to — don't assume `AppModule` wiring applies to CRM or workers.

## Queues & workers (`src/core/queues/`, `src/workers/`)

- BullMQ is configured once in `src/core/queues/bullmq/bullmq.module.ts` (Redis connection, queue prefix `reporting:bullmq`, default job options).
- Queue names are constants in `src/core/queues/bullmq/bullmq.constants.ts` (e.g. `QUEUE_REPORTING_MASTER`, `QUEUE_REPORTING_BATCH`, `QUEUE_WSD_HNRD_SCANNER`, ...). Always reference the constant, never a literal queue name string.
- A worker is a class extending `WorkerHost`, decorated `@Processor(QUEUE_NAME, { concurrency })`, implementing `process(job: Job<JobData>)`. Wrap risky work in try/catch and report failures via `errorAdapter.capture(err, { context, jobId })`, then rethrow so BullMQ retry/backoff applies.
- Feature-specific worker code lives under `src/modules/<feature>/worker/`; the actual worker process entrypoints live under `src/workers/<name>/`.
- Master worker schedules/orchestrates; batch worker(s) consume the work — run multiple batch worker instances for parallelism, don't add concurrency hacks inside a single processor unless already using the `concurrency` option.

## Do not

- Do not put business logic in guards/interceptors/pipes/middlewares — those are cross-cutting only.
- Do not bypass `DatabaseModule` to instantiate a Prisma client manually.
- Do not add a new top-level app/entrypoint without updating `package.json` scripts and this doc.