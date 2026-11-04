---
paths:
  - 'src/modules/**'
  - 'src/core/**'
  - 'src/app*.module.ts'
  - 'src/main*.ts'
---

# NestJS Architecture Rules

Full rules: `docs/ai/02-architecture-rules.md`, `docs/ai/03-nestjs-rules.md`. Controller decorator/route/Swagger-example conventions: `docs/api-controller.docs.md`.

- Controller → thin (HTTP + DTO validation + Swagger only). Service → business logic. Repository (optional) → Prisma access for one entity.
- Module layout: `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`, `dto/`, optional `repositories/`, `worker/`, `types/`.
- This repo has multiple runnable apps from one codebase: main API (`AppModule`/`main.ts`), CRM API (`AppCrmModule`/`main-crm.ts`), and standalone workers (`src/workers/*`). Register a new module only in the app(s) it actually belongs to.
- Controllers: version explicitly (`@Controller({ path, version: '1' })`), document with `@ApiTags`/`@ApiOperation`/`@ApiResponse`/`@ApiCommonErrorsResponse()`.
- BullMQ: reference queue name constants from `src/core/queues/bullmq/bullmq.constants.ts`, never literals. Processors extend `WorkerHost`, use `@Processor(QUEUE_NAME, { concurrency })`, and report failures via `errorAdapter.capture(err, { context, jobId })` before rethrowing.
- Global cross-cutting concerns (guards/interceptors/pipes/filters) are wired once in `src/core/bootstrap/` — don't re-register per module/controller.
