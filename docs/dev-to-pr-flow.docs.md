# Dev → PR Flow (Reporting)

Simple gatekeepers to keep branches healthy.

## Before committing (local)

- Run formatter and lint: `npm run prettier:check` and `npm run lint:check`.
- Ensure commit messages follow our commit rules (commitlint runs via hook).
- Ensure audit and security checks pass: `npm audit`: not `high`/`critical`.

## Before pushing

- Run quick tests: `npm run test:unit` and `npm run test:integration`.

## Before merging to develop or staging

- End-to-end must be green in CI (pipeline runs e2e and already includes unit + integration).
- If you run locally: `npm run test:e2e` (ensure Postgres/Redis per `.env.test`) -> refer to [docs/testing-flows.md](testing-flows.md).
