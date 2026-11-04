# 04 — Database Rules

> See [00-project-overview.md](./00-project-overview.md) for the full index.

## Multi-schema Prisma setup

This service talks to **four independent PostgreSQL databases/schemas**, each with its own Prisma schema and generated client under `src/core/databases/<schema>/`:

| Schema | Service | Notes |
|---|---|---|
| `reporting` | `ReportingPrismaService` | Primary read/write DB for this service |
| `wsd` | `WsdPrismaService` | **Read-only** — `create`/`update`/`delete` throw `InfrastructureError('Read-only client', 'READ_ONLY_CLIENT')` |
| `wsd` (v2) | `WsdV2PrismaService` | Write-capable WSD client, used by scanners/workers that need to persist WSD data |
| `crm` | `CrmPrismaService` | CRM schema |
| `zendesk` | `ZendeskPrismaService` | Zendesk schema |

All five are provided by the `@Global()` `DatabaseModule` (`src/core/databases/database.module.ts`) — inject only the ones a service actually needs.

```ts
@Injectable()
export class WsdService {
  constructor(
    private readonly wsdPrismaService: WsdPrismaService,
    private readonly crmPrismaService: CrmPrismaService,
  ) {}
}
```

**Never** use `WsdPrismaService` for writes — it will throw at runtime. Use `WsdV2PrismaService` when a write to WSD data is required.

## Prisma service pattern

Each `*.prisma.service.ts` extends its generated client and implements `OnModuleInit`/`OnModuleDestroy` to validate the connection URL env var is set, `$connect()`, and `$disconnect()`. Follow this pattern for any new schema client rather than instantiating `PrismaClient` inline anywhere else.

## Repository pattern (optional layer)

For modules with non-trivial queries, put Prisma access in a `<entity>.repository.ts` injected into the service, rather than calling Prisma directly from the service:

```ts
@Injectable()
export class HnrdRepository {
  constructor(private readonly prisma: WsdV2PrismaService) {}

  async hasDomainBeenProcessedToday(domainName: string): Promise<boolean> {
    const count = await this.prisma.hnrd.count({ where: { domainName, dateScanned: { gte: today, lt: tomorrow } } });
    return count > 0;
  }
}
```

Simple modules may call `this.somePrismaService.<table>.findMany(...)` directly from the service — don't force a repository layer for a single trivial query.

## Migrations & client generation

```bash
# Dev migration (reporting schema only)
npm run prisma:migration:dev

# Regenerate all 4 clients (deletes src/core/generated first)
npm run prisma:generate

# Push schemas for test env (no migration history, accepts data loss)
npm run prisma:test:push
```

- Schema files live at `src/core/databases/<schema>/prisma/schema.prisma`.
- Generated clients live in `src/core/generated/` — never hand-edit generated code; regenerate instead.
- After changing any `schema.prisma`, run `npm run prisma:generate` and commit the migration, not just the generated client.

## Query conventions

- Use `Promise.all([...])` to run a data query and a `count` query in parallel for list/pagination endpoints (see [05-api-rules.md](./05-api-rules.md) and [list-api-pagination.docs.md](../list-api-pagination.docs.md)).
- Use `mode: 'insensitive'` for case-insensitive search filters.
- Prefer deterministic/derived IDs for sync/ingestion rows (as used in WCM/WSD sync) plus `skipDuplicates` where applicable, to avoid duplicate rows on re-sync — see [wcm-sync.docs.md](../modules/reporting/wcm-sync.docs.md) / [wsd-sync.docs.md](../modules/reporting/wsd-sync.docs.md).
- Snapshot-heavy tables use a retention policy and (for WCM/WSD) a partitioned-table rollout; see [retention-flows.docs.md](../modules/reporting/retention-flows.docs.md) before adding new high-volume snapshot tables — design retention/partitioning in from the start rather than retrofitting later.