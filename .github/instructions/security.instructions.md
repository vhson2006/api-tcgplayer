---
description: 'Security conventions for this repo: API key guards, rate limiting, secrets, and input validation. Use when touching guards, middlewares, config/env validation, or anything handling authentication or secrets.'
applyTo: 'src/core/guards/**,src/core/middlewares/**,src/configs/**'
---

# Security

Full rules: [docs/ai/08-security-rules.md](../../docs/ai/08-security-rules.md).

- API key guards (`ApiKeyGuard` for `reporting-api-key`, `CrmApiKeyGuard` for `crm-api-key`) are applied globally via `APP_GUARD`. New public routes must be added to the guard's exemption list explicitly — never disable/override the guard per-controller.
- Rate limiting (Express) and NestJS `ThrottlerModule` are both active — don't remove one assuming the other covers it.
- `helmet`, the CORS allowlist (`credentials: true`), and the global `ValidationPipe` are always on — never disable them for a single route.
- All secrets/config come from env vars validated by Zod (`src/configs/env.validation.ts`). Never hardcode or log secrets. New required env vars need both a Zod schema entry and a `.env.sample` entry.
- User input reaching a DB query must go through Prisma's query builder or parameterized raw SQL — never string-concatenated SQL.
