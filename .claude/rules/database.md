---
paths:
  - 'src/core/databases/**'
  - '**/*.prisma'
  - 'src/**/*.repository.ts'
---

# Database Rules (Prisma, multi-schema)

Full rules: `docs/ai/04-database-rules.md`.

- Four independent schemas/clients: `ReportingPrismaService` (read/write), `WsdPrismaService` (**read-only** — write methods throw `InfrastructureError`), `WsdV2PrismaService` (write-capable WSD), `CrmPrismaService`, `ZendeskPrismaService`. All provided by the global `DatabaseModule`.
- Never write through `WsdPrismaService`. Use `WsdV2PrismaService` for WSD writes.
- Put non-trivial Prisma access in a `<entity>.repository.ts` injected into the service; trivial single queries can stay inline in the service.
- Migrations/generation:
  ```bash
  npm run prisma:migration:dev   # dev migration, reporting schema
  npm run prisma:generate        # regenerate all 4 clients (deletes src/core/generated first)
  npm run prisma:test:push       # push schemas for test env
  ```
- Never hand-edit `src/core/generated/**` — regenerate instead.
- List queries: run `findMany` + `count` in `Promise.all`; case-insensitive search uses `mode: 'insensitive'`.
- High-volume snapshot tables need a retention/partitioning plan from the start — see `docs/modules/reporting/retention-flows.docs.md` before adding one.
