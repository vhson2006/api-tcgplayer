---
description: 'Error handling and exception filter conventions for this repo. Use when writing try/catch blocks, throwing errors, or touching the global exception filter / error handler.'
applyTo: 'src/core/filters/**,src/core/error-handler/**,src/core/error-handler.ts'
---

# Error Handling

Full rules: [docs/ai/06-error-handling-rules.md](../../docs/ai/06-error-handling-rules.md).

- Global `HttpExceptionFilter` (`src/core/filters/`) + `UnifiedHandler`/`ServerErrorAdapter` (`src/core/error-handler/`, from `@webyith-commons/*`) handle HTTP error reporting/logging. Don't add per-controller `@UseFilters()` for the same concern.
- Throw typed errors (`ApplicationError`, `InfrastructureError`, or Nest `HttpException` subclasses) over generic `Error`.
- Log context before rethrowing in services; never swallow errors silently.
- BullMQ processors are **not** covered by the HTTP filter — explicitly call `errorAdapter.capture(err, { context, jobId })` before rethrowing so retries still apply and the failure is tracked.
