# 01 — Global Conventions

> See [00-project-overview.md](./00-project-overview.md) for the full index. This file covers naming, formatting, commits, and the dev→PR flow.

## Language & style

- TypeScript everywhere; avoid `any` — prefer explicit types/interfaces or generics.
- Formatting is enforced by Prettier, linting by ESLint (flat config, `eslint.config.mjs`). Do not hand-format against the configured style.
- Run before committing:
  ```bash
  npm run lint:check
  npm run prettier:check
  ```
  Husky + lint-staged already run these on staged files at `precommit`; do not bypass hooks (`--no-verify`).

## File & folder naming

- Kebab-case file names: `wcm.controller.ts`, `wsd-domain-stats.service.ts`, `hnrd.repository.ts`.
- Suffix by role: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts`, `*.processor.ts`, `*.dto.ts`, `*.guard.ts`, `*.interceptor.ts`, `*.filter.ts`, `*.spec.ts`.
- One module per feature under `src/modules/<feature>/`; shared cross-module code goes in `src/shared/` or `src/core/`.

## Path aliases

Use the TS path aliases configured in `tsconfig.json` / `jest.config.ts` instead of long relative paths:

```ts
import { envVars } from '@configs/configuration';
import { logger } from '@/core/logger';
import { BaseResponseDto } from '@/shared/dtos/base-response.dto';
```

## Commit messages

Full rules: [commit-rules.docs.md](../commit-rules.docs.md). Summary — Conventional Commits, enforced by commitlint:

```
<type>(<optional-scope>): <subject>
```

Allowed `type`s: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`/`test(unit)`/`test(integration)`/`test(e2e)`, `build`, `ci`, `chore`, `config`, `tweak`, `migrate`, `setup`, `wip`, `merge`, `revert`. Subject is lowercase, imperative, concise (e.g. `fix(api): guard against null payload`).

## Dev → PR flow

Full flow: [dev-to-pr-flow.docs.md](../dev-to-pr-flow.docs.md). Summary of gatekeepers an AI agent should self-check before considering a change "done":

1. **Before committing:** `npm run prettier:check`, `npm run lint:check` pass; `npm audit` shows no `high`/`critical` vulnerabilities; commit message follows the rules above.
2. **Before pushing:** `npm run test:unit` and `npm run test:integration` pass.
3. **Before merging to develop/staging:** e2e must be green (`npm run test:e2e`, requires local Postgres/Redis per `.env.test` — see [testing-flows.md](../testing-flows.md)).

## Documentation

- Update the relevant `docs/*.md` or `docs/ai/*.md` file when you change a convention or flow it describes — don't let docs drift from code.
- Do not duplicate content across docs; link instead (e.g. `docs/ai/*` links to `docs/*.docs.md` runbooks rather than repeating steps).