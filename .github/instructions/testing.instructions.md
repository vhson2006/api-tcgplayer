---
description: 'Unit, integration, and e2e testing conventions for this repo. Use when writing or modifying any test file under tests/.'
applyTo: 'tests/**'
---

# Testing Conventions

Full rules: [docs/ai/07-testing-rules.md](../../docs/ai/07-testing-rules.md), [docs/ai/10-e2e-test-instruction.md](../../docs/ai/10-e2e-test-instruction.md), [docs/testing-flows.md](../../docs/testing-flows.md).

- Layout: `tests/unit` (mocked deps, no real DB), `tests/integration` (real test DB), `tests/e2e` (full app + Supertest, `--runInBand`), `tests/setup` (global setup/seed), `tests/seeds`, `tests/shared` (shared mocks).
- Naming: `<subject>.spec.ts`, `describe('[<file-under-test>] (unit)', ...)`.
- Commands: `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`, `npm test` (all three).
- e2e requires `.env.test` (copy from `.env.test.sample`) and local Postgres/Redis; always send the `reporting-api-key`/`crm-api-key` header; assert the full response envelope, not just `data`.
- New/changed service logic → unit test. New/changed endpoint → e2e happy path + key error cases (validation, missing API key, not found).
- Never leave `.skip`/`.only` in committed tests.
