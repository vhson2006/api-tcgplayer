# 08 — Security Rules

> See [00-project-overview.md](./00-project-overview.md) for the full index.

## Authentication (API key)

- Reporting API: header `reporting-api-key`, enforced by `ApiKeyGuard` (`src/core/guards/api-key.guard.ts`), applied globally via `APP_GUARD` in `app.module.ts`.
- CRM API: header `crm-api-key`, enforced by `CrmApiKeyGuard`, applied globally in `app-crm.module.ts`.
- Exempted routes: Swagger docs, `health`, `testecho`. **Any new public route must be added to the guard's exemption list explicitly** — never disable/override the guard per-controller.
- Internal service-to-service auth (e.g. Keycloak) uses OAuth2 client-credentials via `src/modules/keycloak-api/` — configured with `KEYCLOAK_ISSUER`, `KEYCLOAK_INTERNAL_CLIENT_ID`, etc. Use this for calling other internal services, not the API key header.

## Rate limiting & throttling

- Express-level rate limiter (`src/core/bootstrap/rate-limit.ts`): window/max configurable via `REPORTING_RATE_LIMIT_ENABLED`, `REPORTING_RATE_LIMIT_WINDOW_MS`, `REPORTING_RATE_LIMIT_MAX` (default 15 min / 200 requests).
- NestJS `ThrottlerModule` (per-IP, `src/core/bootstrap/throttler.ts`), configurable via throttler env vars (default 20 req / 60s).
- Both exist for different layers of protection — don't remove one assuming the other covers it.

## Transport/hardening

- `helmet()` is applied globally (`contentSecurityPolicy` only enabled in production).
- CORS is restricted to `envVars.corsOrigins` with `credentials: true` — do not widen to `origin: '*'`.
- `compression()` is applied globally.
- Body size limited to `50mb` for JSON/urlencoded — don't raise this without a reason tied to an actual payload requirement.

## Input validation

- Global `ValidationPipe({ transform: true })` validates every DTO with `class-validator` decorators. **Every** controller input (body, query, params) must be a decorated DTO class — never accept untyped `any`/raw `Request` bodies.
- Sanitize/validate any value used in a Prisma `where` clause built from user input; prefer Prisma's parameterized query builder (already safe from SQL injection) over raw SQL. If raw SQL (`$queryRaw`/`$executeRaw`) is unavoidable, use tagged-template parameterization, never string concatenation of user input.

## Secrets & configuration

- All secrets/config come from environment variables validated by Zod (`src/configs/env.validation.ts` / `env.test.validation.ts`) — never hardcode API keys, DB URLs, or tokens in source.
- `.env` / `.env.test` are gitignored; only `.env.sample` / `.env.test.sample` are committed. When adding a new required env var, add it to both the Zod schema and the relevant `.sample` file.
- Do not log secrets (API keys, tokens, full connection strings) — the `logger`/`HttpLoggerInterceptor` capture request metadata; make sure new logging calls don't leak sensitive fields.

## OWASP-relevant reminders for this codebase

- **Broken access control:** always go through the API key guard + (where applicable) Keycloak auth; never add a route that bypasses both for convenience.
- **Injection:** use Prisma's query builder; validate all DTOs; never build shell commands or SQL from unsanitized input.
- **Security misconfiguration:** don't disable `helmet`, CORS restrictions, or the validation pipe for a single route to "make it easier."
- **Vulnerable dependencies:** check `npm run lint:check`/CI and the `overrides` section in `package.json` before adding a new dependency with known CVEs; prefer already-used libraries.
- **Logging failures:** always log security-relevant failures (auth failures, validation failures) with enough context to investigate, without leaking secrets.