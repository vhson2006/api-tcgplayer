# 03 — NestJS Rules

> See [00-project-overview.md](./00-project-overview.md) for the full index.

## Modules

```ts
@Module({
  imports: [DatabaseModule /* or feature-specific modules */],
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}
```

- Import only what the module needs; `DatabaseModule` is `@Global()` so it does not need re-exporting, but still import it explicitly where its providers are used for clarity.
- Register the module in `src/app.module.ts` (main API) and/or `src/app-crm.module.ts` (CRM API) and/or the relevant worker module — not all three by default.

## Controllers

Full convention doc with real examples: [api-controller.docs.md](../api-controller.docs.md).

- Version routes explicitly: `@Controller({ path: 'wcm', version: '1' })`.
- Annotate with `@ApiTags(...)`; document every route with `@ApiOperation`, `@ApiResponse`/`@ApiOkResponse` (typed to the response DTO, with an `examples` block), and `@ApiCommonErrorsResponse()` for standard error responses.
- Controllers return the typed response DTO (e.g. `Promise<ApiV1WcmResponseDto>`) and delegate all logic to a service — no Prisma calls, no business logic in the controller.
- Use `@HttpCode(...)` explicitly when the default status isn't what's documented.

```ts
@ApiTags('WCM Reporting APIs')
@Controller({ path: 'wcm', version: '1' })
export class WcmController {
  constructor(private readonly wcmService: WcmService) {}

  @Post('content-analysis')
  @ApiOperation({ summary: 'Get content analysis findings' })
  @ApiResponse({ status: 200, type: ApiV1ContentAnalysisResponse })
  @ApiCommonErrorsResponse()
  @HttpCode(200)
  contentAnalysis(@Body() body: ApiV1ContentAnalysisBodyDto): Promise<ApiV1ContentAnalysisResponse> {
    return this.wcmService.contentAnalysis(body);
  }
}
```

## Guards

- `src/core/guards/api-key.guard.ts` — validates `reporting-api-key` header, applied globally via `APP_GUARD` in `app.module.ts`. Exempts Swagger docs, `health`, `testecho` routes.
- `src/core/guards/crm-api-key.guard.ts` — same pattern for the CRM app (`crm-api-key` header), wired in `app-crm.module.ts`.
- New public/exempt routes must be added to the guard's exemption list explicitly — do not disable the guard at the controller level.

## Interceptors

- `ResponseInterceptor` — wraps every controller return value into the standard envelope (`success`, `messages`, `data`, `metadata`, `timestamp`). See [05-api-rules.md](./05-api-rules.md). Do not manually build this envelope in a controller/service — return the raw `data`/`message`/`metadata` shape and let the interceptor do it.
- `HttpLoggerInterceptor` — logs method/URL/status/duration/IP and captures request context for error reporting. Runs after `ResponseInterceptor` in the global interceptor order.

## Pipes & Middlewares

- Global `ValidationPipe({ transform: true })` is already registered — every DTO with `class-validator` decorators is validated and query/body values are transformed (string → number/boolean) automatically. Don't re-instantiate `ValidationPipe` per route unless you need different options.
- `src/core/pipes/` and `src/core/middlewares/` are currently empty scaffolds; add a new pipe/middleware here only when it's a true cross-cutting concern, not module-specific behavior. Module-specific middleware (e.g. duplicate-request protection) is configured inside that module's `configure()` method instead (see `recommendation.module.ts`).

## Dependency injection

- Constructor-inject everything (`private readonly xService: XService`); avoid manual instantiation or service locators.
- Prisma services (`ReportingPrismaService`, `WsdPrismaService`, `WsdV2PrismaService`, `CrmPrismaService`, `ZendeskPrismaService`) come from the global `DatabaseModule` — inject the specific one(s) a service needs, don't inject all five by default.