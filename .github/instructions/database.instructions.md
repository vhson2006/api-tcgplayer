---
description: 'Prisma multi-schema database conventions for this repo. Use when writing or reviewing Prisma schemas, migrations, repositories, or any Prisma client usage.'
applyTo: 'src/core/databases/**,**/*.prisma,src/**/*.repository.ts'
---

# Database (Prisma, multi-schema)

Full rules: [docs/ai/04-database-rules.md](../../docs/ai/04-database-rules.md).

- Four independent schemas/clients from the global `DatabaseModule`: `ReportingPrismaService` (read/write), `WsdPrismaService` (**read-only** — write methods throw `InfrastructureError`), `WsdV2PrismaService` (write-capable WSD), `CrmPrismaService`, `ZendeskPrismaService`.
- Never write through `WsdPrismaService`; use `WsdV2PrismaService` for WSD writes.
- Put non-trivial Prisma access in a `<entity>.repository.ts` injected into the service; trivial single queries may stay inline in the service.
- Migrations/generation: `npm run prisma:migration:dev` (dev migration), `npm run prisma:generate` (regenerate all 4 clients — deletes `src/core/generated` first), `npm run prisma:test:push` (test env).
- Never hand-edit `src/core/generated/**` — regenerate instead.
- List queries: run `findMany` + `count` in `Promise.all`; case-insensitive search uses `mode: 'insensitive'`.
- High-volume snapshot tables need a retention/partitioning plan from the start — see [docs/modules/reporting/retention-flows.docs.md](../../docs/modules/reporting/retention-flows.docs.md) before adding one.
