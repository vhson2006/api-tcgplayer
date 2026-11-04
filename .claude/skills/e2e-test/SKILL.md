---
name: e2e-test
description: Write or run an e2e test for an API endpoint in this repo, following the project's e2e conventions (real app boot, Supertest, API key header, full envelope assertions). Use when asked to add e2e coverage or debug a failing e2e test.
argument-hint: [route-or-feature]
---

Write or run an e2e test for `$ARGUMENTS`, following `docs/ai/10-e2e-test-instruction.md` (read it first for the full checklist).

Key points to apply:

1. Ensure `.env.test` exists locally (copy from `.env.test.sample`) and Postgres/Redis are reachable before running `npm run test:e2e`.
2. Place the spec under `tests/e2e/`, matching the existing naming convention in that folder.
3. Boot the real Nest app (check `tests/e2e/` for an existing shared bootstrap helper before writing a new one) and use `supertest` against the real versioned route (`/api/v1/...`).
4. Always send the `reporting-api-key` (or `crm-api-key` for CRM routes) header; include one test asserting the request is rejected without it.
5. Assert on the full response envelope (`success`, `messages`, `data`, `metadata`, `timestamp`), not just `data`.
6. Cover: happy path, validation failure, missing/invalid API key, and not-found/empty-result where relevant.
7. Run with `npm run test:e2e` (already `--runInBand`) — don't invoke `jest` directly with different flags.

If asked to just run e2e tests rather than write new ones, run `npm run test:e2e` and report failures with file + assertion context.
