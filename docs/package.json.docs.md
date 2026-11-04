# Scripts

- `build` — compile Nest app to `dist` with the production tsconfig.
- `start` — run compiled app from `dist/main`.
- `start:dev` — start Nest in watch mode for the main app entry.
- `start:worker:master:dev` / `start:worker:batch:dev` — watch-mode entrypoints for the two worker processes.
- `start:worker:master:prod` / `start:worker:batch:prod` — run compiled worker entrypoints.
- `start:worker:prod` — run both workers in parallel (prod build) via `concurrently`.
- `start:worker:wsd-domain-scanner:dev` / `start:worker:wsd-domain-scanner:prod` — run the WSD domain scanner worker with `UV_THREADPOOL_SIZE=64`. A scan checks ~100 permutations in parallel, and anything resolving a hostname through the OS (`dns.lookup`, used by `fetch`/`net.connect` for banners and geo) queues on libuv's threadpool, which defaults to 4 threads. libuv reads this variable once, the first time the threadpool is used, so it must be set before the process starts: a value from `.env` (loaded by `dotenv` at runtime) arrives too late and is silently ignored. The prod script uses plain `VAR=value` (not `cross-env`, a devDependency) so it still works if dev dependencies are pruned from the image; a deployment that starts the worker without this npm script must set the variable in the container env.
- `lint:check` / `lint:fix` — eslint check or auto-fix across the repo.
- `prettier:check` / `prettier:fix` — formatting check or write for src files.
- `prepare` / `precommit` — husky + lint-staged hooks wiring.
- `test` — run full Jest suite (unit, integration, e2e) serially using `jest.config.all.ts`.
- `test:unit` / `test:integration` / `test:e2e` — targeted Jest configs for each layer; e2e runs in-band by default.
- `prisma:migration:dev` — run Prisma migrate for reporting DB in development.
- `prisma:test:push` — push Prisma schemas for test env across reporting/wsd/crm DBs (no generate, accept data loss).
- `prisma:generate` — delete generated clients then regenerate for reporting, wsd, and crm schemas in development.
