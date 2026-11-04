# Commit Rules

This repo uses **Commitlint + Conventional Commits** with a custom list of `type` values.

## Format

```
<type>(<optional-scope>): <subject>

<optional body>

<optional footer>
```

- `subject` is lowercase, concise, and written in the imperative mood (e.g., "add", "fix", "refactor").
- `scope` is optional; use a short path or domain (examples: `api`, `auth`, `docs`, `ci`, `tests`).

## Allowed types

- `feat` – new feature
- `fix` – bug fix
- `perf` – performance improvement
- `refactor` – code change that neither fixes a bug nor adds a feature
- `docs` – documentation changes
- `test`, `test(unit)`, `test(integration)`, `test(e2e)` – tests
- `build` – build system or dependencies
- `ci` – CI configuration
- `chore` – maintenance tasks
- `config` – configuration files/flags
- `tweak` – small, low‑risk adjustments
- `migrate` – migrations or large moves
- `setup` – initial or foundational setup
- `wip` – work in progress (avoid on mainline branches)
- `merge` – merge commits
- `revert` – revert a previous commit

## Examples

- `feat(auth): add JWT rotation`
- `fix(api): guard against null payload`
- `test(e2e): cover health endpoint without api key`
- `docs: record commit rules`

## Footers (optional)

- Reference issues or tasks in the footer, e.g., `Refs: ISSUE-1234`.
- Use `BREAKING CHANGE: <description>` when applicable.
