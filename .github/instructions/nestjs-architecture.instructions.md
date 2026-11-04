---
description: 'NestJS module/controller/service architecture conventions for this repo. Use when creating or modifying modules, controllers, services, guards, interceptors, pipes, filters, or BullMQ processors.'
applyTo: 'src/modules/**,src/core/**,src/app*.module.ts,src/main*.ts'
---

# NestJS Architecture

Full rules: [docs/ai/02-architecture-rules.md](../../docs/ai/02-architecture-rules.md), [docs/ai/03-nestjs-rules.md](../../docs/ai/03-nestjs-rules.md). Controller decorator/route/Swagger-example conventions: [docs/api-controller.docs.md](../../docs/api-controller.docs.md).

- Controller → thin (HTTP + DTO validation + Swagger docs only). Service → business logic. Repository (optional) → Prisma access for one entity.
- Standard module layout: `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`, `dto/`, optional `repositories/`, `worker/`, `types/`.
- Multiple apps share this codebase: main API (`AppModule`/`main.ts`), CRM API (`AppCrmModule`/`main-crm.ts`), and standalone workers (`src/workers/*`). Register a new module only in the app(s) it belongs to.
- Controllers: version explicitly (`@Controller({ path, version: '1' })`); document with `@ApiTags`/`@ApiOperation`/`@ApiResponse`/`@ApiCommonErrorsResponse()`.
- BullMQ processors: reference queue name constants from `src/core/queues/bullmq/bullmq.constants.ts` (never literals), extend `WorkerHost`, use `@Processor(QUEUE_NAME, { concurrency })`, and call `errorAdapter.capture(err, { context, jobId })` before rethrowing on failure.
- Global concerns (guards/interceptors/pipes/filters) are wired once in `src/core/bootstrap/` — don't re-register per module/controller.
