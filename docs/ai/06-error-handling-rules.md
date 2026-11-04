# 06 — Error Handling Rules

> See [00-project-overview.md](./00-project-overview.md) for the full index.

## Architecture

- `src/core/error-handler/index.ts` builds a single `UnifiedHandler` (from `@webyith-commons/core`) — handles logging, optional notifications, and error summarization/buffering — plus a `ServerErrorAdapter` (`errorAdapter`) used to explicitly capture non-HTTP errors (e.g. inside BullMQ processors).
- `src/core/filters/http-exception.filter.ts` defines `HttpExceptionFilter` (`@Catch()`), extending `GlobalExceptionFilter` from `@webyith-commons/server`, wired to `errorHandler`. Registered globally in the bootstrap pipeline (`app.useGlobalFilters(new HttpExceptionFilter())`) — do not add per-controller `@UseFilters()` for the same concern.
- Custom error types (`ApplicationError`, `InfrastructureError`, etc.) come from `@webyith-commons/core`. Use `InfrastructureError` for infra-level failures (e.g. the WSD read-only client throwing on writes) and `ApplicationError` for domain/business rule violations (e.g. invalid config).

## How to throw errors in services

- Prefer throwing typed errors (`ApplicationError`, `InfrastructureError`, or Nest's built-in `HttpException` subclasses like `BadRequestException`) over generic `Error`.
- Log context before rethrowing so operators can correlate:

```ts
try {
  // ...
} catch (error) {
  logger.error('List active threat domains failed', undefined, WSD_CONTEXT, {
    domain,
    error: error instanceof Error ? error.message : String(error),
  });
  throw error; // let the global filter/errorAdapter handle the response + reporting
}
```

- Do not swallow errors silently. If a failure is recoverable (e.g. optional enrichment step), log at `warn` and continue — don't `catch` and return an empty/undefined result without logging.

## Errors inside BullMQ processors

Processors are **not** covered by the HTTP exception filter. Explicitly capture errors via `errorAdapter.capture(err, { context, jobId })` before rethrowing, so BullMQ's retry/backoff still applies and the failure is still tracked centrally:

```ts
try {
  await this.engine.processDomain(job.data);
} catch (err) {
  errorAdapter.capture(err, { context: 'HnrdScannerProcessor', jobId: job.id });
  throw err;
}
```

## What the client sees

Errors are still returned in a predictable shape through `HttpExceptionFilter`; do not hand-roll a different error response shape in a controller. Document expected error responses on endpoints with `@ApiCommonErrorsResponse()`.