# 07 — Testing Rules

> See [00-project-overview.md](./00-project-overview.md) for the full index. For step-by-step local setup, see [testing-flows.md](../testing-flows.md) and [10-e2e-test-instruction.md](./10-e2e-test-instruction.md).

## Layout

```
tests/
├── unit/          # jest-unit.config.cjs — pure logic, mocked dependencies
├── integration/   # jest-integration.config.cjs — real DB/Redis where relevant
├── e2e/           # jest-e2e.config.ts — full app + Supertest, --runInBand
├── setup/         # global setup/teardown (DB provisioning, schema push, seeds)
├── seeds/         # fixture data
└── shared/        # shared mocks/utilities (axios.mock.ts, prisma.mock.ts, logger.mock.ts, keycloak-service.mock.ts, ...)
```

Test files are colocated by mirrored path under the matching `tests/<layer>/` tree and named `<subject>.spec.ts` (e.g. `tests/unit/core/filters/http-exception.filter.spec.ts`).

## Commands

```bash
npm run test:unit          # tests/unit
npm run test:integration   # tests/integration
npm run test:e2e           # tests/e2e, requires local Postgres/Redis per .env.test
npm test                   # everything, jest.config.all.cjs, --runInBand
```

## Writing unit tests

- Mock Prisma/HTTP/logger via the shared mocks in `tests/shared/mocks/` — do not hit a real DB in `tests/unit`.
- Test the service/utility in isolation; construct it directly or via `Test.createTestingModule` with mocked providers.
- Match the existing `describe('[<file-under-test>] (unit)', ...)` naming style used across the codebase.

```ts
describe('[http-exception.filter.ts] (unit)', () => {
  const filter = new HttpExceptionFilter();

  it('should respond with status and message from HttpException', () => {
    const { host, status, json } = createMockHost();
    filter.catch(new HttpException('Bad things', HttpStatus.BAD_REQUEST), host);
    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });
});
```

## Writing integration tests

- Use the real test databases (provisioned by `tests/setup/globalSetup.ts` via `.env.test`) rather than mocking Prisma, when the goal is to validate query behavior.
- Keep scope to one module/service + its DB interactions; don't spin up the full HTTP app here (that's what e2e is for).

## Writing e2e tests

See [10-e2e-test-instruction.md](./10-e2e-test-instruction.md) for the full walkthrough. Short version: boot the real Nest app with Supertest, hit real routes (including the `reporting-api-key` header), assert on the full response envelope.

## General rules

- Every new service method with non-trivial logic needs a unit test.
- Every new/changed API endpoint needs (at minimum) an e2e happy-path test plus the key error cases (validation failure, missing API key, not found).
- Do not commit code with failing/skipped tests (`.skip`, `.only`) left in.
- `collectCoverageFrom` excludes `main.ts`, `*.module.ts`, `*.config.ts`, `src/core/databases/**`, `src/core/generated/**` — focus test effort on services, controllers, guards, interceptors, filters, utils.