---
name: security-review
description: Run a security review of a change in this repo (auth, tenant scoping, sensitive data, injection, secrets, logging) using the project's own security rules. Use before opening a PR, or when asked to security-review a diff, file, module, or endpoint.
argument-hint: [diff | file | module | endpoint]
---

Security-review `$ARGUMENTS` (default: the uncommitted diff plus commits on the current branch vs `main`). Read `docs/ai/08-security-rules.md` and the Security block of `docs/ai/09-code-review-instruction.md` first — they hold the authoritative rules; this skill is the procedure for applying them.

Report findings in the severity order from `docs/ai/09-code-review-instruction.md` (Critical / Should fix / Suggestion), each with file + line and the rule it breaks. Do not report style issues here — `/code-review` covers those.

## Pass 1 — Authentication & authorization

1. Every new/changed route is covered by the global `ApiKeyGuard` (`reporting-api-key`) or `CrmApiKeyGuard` (`crm-api-key`). Flag any per-controller guard override, `@Public()`-style bypass, or new entry in a guard exemption list that isn't health/testecho/docs with a documented reason.
2. Routes registered in the correct app (`AppModule` vs `AppCrmModule`) — a CRM route reachable with a reporting key is a finding.
3. Service-to-service calls use the Keycloak client-credentials flow in `src/modules/keycloak-api/`, not a shared static key.

## Pass 2 — Tenant scoping & data exposure

4. Any query filtered by `customerId`/domain derives that value from validated input, never from an optional field that can arrive `undefined` — an absent filter that silently returns all customers' rows is Critical.
5. Response DTOs expose only the fields the endpoint needs. Flag returning whole Prisma entities that carry internal IDs, tokens, actor emails or upstream sync metadata.
6. No writes attempted through the read-only `WsdPrismaService`.

## Pass 3 — Input validation & injection

7. Every body/query/param is a decorated DTO class validated by `class-validator` — no untyped `any` or raw `Request` bodies.
8. `$queryRaw`/`$executeRaw` use tagged-template parameterization. String-concatenated SQL built from user input is Critical.
9. Pagination/sort inputs are bounded and allowlisted (no arbitrary `orderBy` field from the client).

## Pass 4 — Secrets, config & logging

10. No hardcoded keys, tokens or connection strings; new env vars appear in `src/configs/env.validation.ts` **and** `.env.sample`.
11. No secret, full connection string, API key or raw request body reaches a log call — check new `logger`/`errorAdapter.capture` calls for leaked fields.
12. Errors returned to the client don't expose stack traces, SQL, or upstream URLs.

## Pass 5 — Coverage

13. Security-relevant behaviour has a test: an e2e case asserting the route is rejected without an API key, and unit coverage for any authorization/scoping branch.

## Prompt templates

Use these when a deeper look is wanted on one area:

- **Threat model:** "For `<module>`, list the trust boundaries (client → API, API → Postgres, API → upstream WSD/WCM/CRM, worker → Redis). For each, state what an attacker controls, what the worst outcome is, and which existing control in `docs/ai/08-security-rules.md` blocks it. Flag boundaries with no control."
- **Auth review:** "Trace every route in `<module>` from decorator to service. For each: which guard applies, what identity it establishes, and what an unauthenticated or wrong-tenant caller receives. List any route whose protection depends on something other than the global guard."
- **Sensitive-data review:** "List every field this change reads from or writes to the `wsd`/`crm`/`zendesk` schemas, and every field it logs or returns. Mark any that is a credential, an email, a customer domain or an audit actor, and say where it ends up."
- **Tenant-scoping review:** "Show every DB query in this change with its `where` clause. For each, state where the customer scope comes from and what happens if that value is `undefined`, empty, or supplied by the caller."

Never paste real credentials, production rows or raw logs into a prompt while doing this review — see `docs/ai/11-ai-usage-policy.md`.
