# 09 — Code Review Instruction (for AI agents)

> See [00-project-overview.md](./00-project-overview.md) for the full index. Use this checklist whenever reviewing a diff/PR in this repo, or self-reviewing before finishing a task.

## Checklist

**Architecture & conventions** ([02](./02-architecture-rules.md), [03](./03-nestjs-rules.md))
- [ ] Controller stays thin (no Prisma calls, no business logic); logic lives in a service.
- [ ] New module follows the standard folder layout and naming (`*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`).
- [ ] Correct app/module registered in (main `AppModule` vs `AppCrmModule` vs a worker module) — not blindly copy-pasted into all three.

**Database** ([04](./04-database-rules.md))
- [ ] Correct Prisma client injected for the schema (`Reporting`/`Wsd`/`WsdV2`/`Crm`/`Zendesk`); no writes attempted through the read-only `WsdPrismaService`.
- [ ] Schema changes include a migration and `npm run prisma:generate` was run (generated client not hand-edited).
- [ ] List queries run `findMany` + `count` in parallel; search uses `mode: 'insensitive'` where relevant.

**API** ([05](./05-api-rules.md))
- [ ] Route is versioned (`@Controller({ path, version: '1' })`), documented (`@ApiTags`/`@ApiOperation`/`@ApiResponse`/`@ApiCommonErrorsResponse()`).
- [ ] Request/response DTOs follow the naming table and use `class-validator`/`class-transformer` decorators; no untyped `any` bodies.
- [ ] Service returns `{ data, message?, metadata? }` and lets `ResponseInterceptor` build the envelope — no manual envelope construction.
- [ ] Pagination follows the standard shape if it's a list endpoint.

**Error handling** ([06](./06-error-handling-rules.md))
- [ ] Errors are typed where possible (`ApplicationError`/`InfrastructureError`/Nest `HttpException` subclasses), logged with context before rethrow, never silently swallowed.
- [ ] BullMQ processors call `errorAdapter.capture(err, { context, jobId })` before rethrowing.

**Security** ([08](./08-security-rules.md))
- [ ] New routes are covered by the API key guard (or explicitly, deliberately exempted with a documented reason).
- [ ] No secrets/tokens/connection strings hardcoded or logged.
- [ ] User input reaching a DB query goes through Prisma's query builder or parameterized raw SQL — never string-concatenated SQL.
- [ ] New env vars added to Zod validation schema + `.env.sample`.

**Testing** ([07](./07-testing-rules.md), [10](./10-e2e-test-instruction.md))
- [ ] New/changed service logic has unit tests; new/changed endpoints have e2e coverage (happy path + key error cases).
- [ ] No `.skip`/`.only` left in test files.
- [ ] `npm run lint:check`, `npm run prettier:check`, `npm run test:unit`, `npm run test:integration` all pass locally before requesting review/merge (see [01-global-conventions.md](./01-global-conventions.md)).

**Commit hygiene** ([01](./01-global-conventions.md))
- [ ] Commit messages follow Conventional Commits with the repo's allowed `type`s.
- [ ] PR/change stays focused — no unrelated refactors bundled in.

## How to report findings

When reviewing, group findings by severity:

1. **Critical** — security issues, data corruption risk, breaks the read-only WSD contract, missing auth on a sensitive route.
2. **Should fix** — convention violations (envelope, DTO naming, missing tests), missing error handling.
3. **Suggestion** — style/readability improvements that don't block merging.

Always cite the specific file/line and, where relevant, which `docs/ai/*.md` rule is violated.