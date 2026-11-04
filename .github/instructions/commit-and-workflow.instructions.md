---
description: 'Use when writing commit messages, opening a PR, or asked about the dev-to-PR workflow, commit types, or gatekeepers before merging in this repo.'
---

# Commits & Dev → PR Flow

Full rules: [docs/commit-rules.docs.md](../../docs/commit-rules.docs.md), [docs/dev-to-pr-flow.docs.md](../../docs/dev-to-pr-flow.docs.md).

- Conventional Commits, enforced by commitlint: `<type>(<optional-scope>): <subject>`, lowercase imperative subject.
- Allowed `type`s: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`/`test(unit)`/`test(integration)`/`test(e2e)`, `build`, `ci`, `chore`, `config`, `tweak`, `migrate`, `setup`, `wip`, `merge`, `revert`.
- Before committing: `npm run prettier:check`, `npm run lint:check` pass; `npm audit` shows no `high`/`critical` vulnerabilities.
- Before pushing: `npm run test:unit` and `npm run test:integration` pass.
- Before merging to develop/staging: e2e must be green (`npm run test:e2e`, needs local Postgres/Redis per `.env.test`).
- Never bypass hooks (`--no-verify`) to skip these checks.
