# Copilot Instructions — Webyith Reporting

NestJS backend aggregating reporting data (WCM, WSD, CRM, threat feeds) into PostgreSQL via Prisma (4 schemas: `Reporting`/`Wsd`/`WsdV2`/`Crm`/`Zendesk`) with BullMQ background workers.

## Source of truth

Detailed, authoritative rules live in **`docs/ai/*.md`** — read the relevant file before implementing in that area rather than guessing conventions:

| Area                                            | File                                    |
| ----------------------------------------------- | --------------------------------------- |
| Project overview / index                        | `docs/ai/00-project-overview.md`        |
| Naming, commits, dev→PR flow                    | `docs/ai/01-global-conventions.md`      |
| Module layout, bootstrap, queues/workers        | `docs/ai/02-architecture-rules.md`      |
| Controllers/guards/interceptors/pipes           | `docs/ai/03-nestjs-rules.md`            |
| Prisma multi-schema, repositories, migrations   | `docs/ai/04-database-rules.md`          |
| Versioning, response envelope, DTOs, pagination | `docs/ai/05-api-rules.md`               |
| Exception filter, error classes, logging        | `docs/ai/06-error-handling-rules.md`    |
| Unit/integration/e2e conventions                | `docs/ai/07-testing-rules.md`           |
| API keys, rate limiting, secrets                | `docs/ai/08-security-rules.md`          |
| Code review checklist                           | `docs/ai/09-code-review-instruction.md` |
| Writing/running e2e tests                       | `docs/ai/10-e2e-test-instruction.md`    |

Path-specific instructions in `.github/instructions/*.instructions.md` auto-attach when editing matching files and summarize the same rules — treat the `docs/ai/*.md` file they link to as the full detail.

## Build, run, test

```bash
npm install
npm run start:dev                 # main API, watch mode
npm run lint:check && npm run prettier:check
npm run test:unit
npm run test:integration
npm run test:e2e                  # needs local Postgres/Redis, see .env.test
npm run prisma:generate           # regenerate all 4 Prisma clients
```

## Non-negotiables

- Conventional Commits only, allowed `type`s per `docs/commit-rules.docs.md`.
- Controllers stay thin; business logic in services; DB access via the correct schema's Prisma service — never write through the read-only `WsdPrismaService`.
- Every route goes through the global API key guard unless explicitly exempted (health/testecho/docs).
- Responses are wrapped by `ResponseInterceptor` — return `{ data, message?, metadata? }` from services, don't hand-build the envelope.
- New/changed service logic needs unit tests; new/changed endpoints need e2e coverage.
