# 10 — E2E Test Instruction

> See [00-project-overview.md](./00-project-overview.md) for the full index. This expands the e2e section of [testing-flows.md](../testing-flows.md) into step-by-step instructions for an AI agent writing or running e2e tests.

## 1. Prerequisites (once per environment)

1. Ensure `.env.test` exists (copy from `.env.test.sample` if missing).
2. Ensure a local PostgreSQL user `webyith_reporting_test` exists — the test runner creates the actual test databases automatically; you only need the user + credentials to match `.env.test`.
3. Ensure PostgreSQL and Redis are running and reachable at the hosts/ports configured in `.env.test`. If pointing at Docker service names, use `docker-compose.test.yaml` instead of localhost.

## 2. Running e2e tests

**Local:**
```bash
npm run test:e2e
```

**Docker infra + local test run:**
```bash
docker compose -f docker-compose.test.yaml --env-file .env.test up -d --build
npm run test:e2e
```

`test:e2e` uses `tests/e2e/jest-e2e.config.ts` and runs `--runInBand` (serially) — do not parallelize e2e runs; they share the same test database state via `tests/setup/globalSetup.ts` (schema push + seed).

## 3. Writing a new e2e test

1. Place the spec under `tests/e2e/`, named `<feature>.e2e-spec.ts` (mirror existing files for exact suffix used in this folder).
2. Boot the real Nest application via `Test.createTestingModule({ imports: [AppModule] }).compile()` then `app.init()` (or the shared e2e bootstrap helper already used in `tests/e2e/`, if one exists — check for a shared setup util before writing a new one).
3. Use `supertest` against the compiled app, hitting the **actual versioned route** (`/api/v1/...`).
4. Always send the required `reporting-api-key` (or `crm-api-key` for CRM routes) header — requests without it should assert a 401/403, not be skipped.
5. Assert on the full response envelope shape (`success`, `messages`, `data`, `metadata`, `timestamp`), not just `data`.
6. Cover: happy path, validation failure (bad DTO), missing/invalid API key, and not-found/empty-result cases where relevant.
7. Clean up any data the test creates, or rely on the seeded/reset test database state — don't leave e2e tests dependent on execution order beyond what `globalSetup` already guarantees.

## 4. Common pitfalls

- Forgetting the API key header — every non-exempt route needs it.
- Pointing `.env.test` at remote hosts/VMs — e2e is designed for local Postgres/Redis; remote hosts commonly cause flaky failures.
- Running e2e in parallel with other Jest configs against the same test DB — always use `npm run test:e2e` (already `--runInBand`), don't invoke `jest` directly with different flags.
- Asserting only `response.body.data` and ignoring `success`/`messages` — the envelope is part of the contract.

## 5. Full test run

```bash
npm test   # unit + integration + e2e together, jest.config.all.cjs, --runInBand
```

Use this before merging into develop/staging, per [01-global-conventions.md](./01-global-conventions.md).