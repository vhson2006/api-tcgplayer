# 11 — AI Usage Policy (what may be shared with AI tools)

> See [00-project-overview.md](./00-project-overview.md) for the full index. This file governs **what an engineer may put into an AI tool**. [08-security-rules.md](./08-security-rules.md) governs what the resulting code must look like; the two are complementary.

This repo handles customer domains, scan results, audit logs and CRM records. Anything pasted into an AI tool leaves our infrastructure, may be retained by the vendor, and cannot be recalled. Treat a prompt like a message to an external party.

## Never share

- **Credentials of any kind:** contents of `.env` / `.env.test`, `POSTGRES_*_DATABASE_URL` values, `REPORTING_API_KEY` / `CRM_API_KEY`, Keycloak client secrets, Redis credentials, registry tokens. Share the *variable name* if you need help, never the value.
- **Raw production data:** rows from the `wsd`, `crm` or `zendesk` schemas, real customer domain lists, scan/threat results tied to a named customer, `audit_logs` rows containing `actorEmail`.
- **Raw production or staging logs**, including error payloads pasted from a log viewer — they routinely carry tokens, emails and connection strings.
- **Personal data:** customer names, email addresses, phone numbers, ticket contents.
- **Screenshots of production dashboards** that show any of the above.

## Share only after masking

When AI help genuinely needs real-shaped data, reduce it first:

- Replace real domains with `example-customer-1.com`, real emails with `user@example.com`, real IDs with `cust_0001`.
- Trim a log line to the stack frame and the error class; delete headers, query strings and payload bodies.
- Prefer the seed data already in `tests/seeds/` or a fabricated row over an export from any real database.
- If masking would take longer than describing the problem in words, describe it in words.

## Safe to share

Source code in this repository (it is company code, not customer data), schema definitions and migrations, test fixtures and seeds, error messages with values stripped, public library documentation, and architecture questions phrased without customer specifics.

## Tools and surfaces

- Use only company-approved assistants (GitHub Copilot, Claude Code) against this repository. Do not paste repo content into personal accounts or consumer chat apps.
- The repo's own rule files (`docs/ai/*.md`, `.claude/rules/*.md`, `.github/instructions/*`) are loaded automatically — don't work around them by pasting code into an unconfigured tool.

## Reviewing AI output

- Every AI-generated change is read by a human before commit. "It passed the tests" is not review.
- Changes touching auth, guards, tenant scoping, raw SQL, env/config or audit logs require an explicit human security review — run `/security-review` (see `.claude/skills/security-review/`) and address the findings before opening a PR.
- Never merge generated code you cannot explain.

## If something is leaked anyway

Assume the value is compromised: rotate the credential immediately, tell the team lead, and record what was exposed. Rotating early costs minutes; not rotating costs an incident.
