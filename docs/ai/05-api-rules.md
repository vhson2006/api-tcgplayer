# 05 — API Rules

> See [00-project-overview.md](./00-project-overview.md) for the full index.

## Global setup

- Global prefix: `api`. URI versioning enabled, current version `v1` → routes look like `/api/v1/<resource>`.
- Swagger UI: `http://localhost:5000/docs/v1` (reporting API); CRM app has its own Swagger similarly.
- Every route (except health/testecho/docs) requires the `reporting-api-key` header (or `crm-api-key` for the CRM app) — see [08-security-rules.md](./08-security-rules.md).

## Response envelope

All successful responses are wrapped by the global `ResponseInterceptor` into `BaseResponseDto<T>` (`src/shared/dtos/base-response.dto.ts`):

```ts
{
  success: boolean;
  messages: string[];
  data?: T;
  metadata?: PaginationDto;   // only for paginated/list endpoints
  timestamp: string;          // ISO string
}
```

Controllers/services should **not** construct this envelope manually — return `{ data, message?, metadata? }`-shaped values and let `ResponseInterceptor` do the wrapping. Type controller return values as the concrete `ApiV1<Entity>ResponseDto` (extends `BaseResponseDto<T>`) for Swagger accuracy.

## DTO organization

Full guide: [dto-organization.docs.md](../dto-organization.docs.md). Summary:

```
src/shared/dtos/               # BaseResponseDto, PaginationDto — reusable across modules
src/modules/<module>/dto/      # all DTOs for that module's entities
```

Naming pattern per entity:

| Purpose | Pattern | Example |
|---|---|---|
| List query params | `List{Entity}QueryDto` | `ListUserQueryDto` |
| Create body | `Create{Entity}Dto` | `CreateUserDto` |
| Update body | `Update{Entity}Dto` (via `PartialType(Create{Entity}Dto)`) | `UpdateUserDto` |
| Response item | `{Entity}ResponseDto` | `UserResponseDto` |
| Path params | `{Entity}ParamsDto` | `UserParamsDto` |
| List response | `ApiV1{Entity}ResponseDto` | `ApiV1UserResponseDto` |
| Single response | `ApiV1{Entity}SingleResponseDto` | `ApiV1UserSingleResponseDto` |

All fields use `@ApiProperty`/`@ApiPropertyOptional` for Swagger and `class-validator` decorators for validation. Use `class-transformer` (`@Type(() => Number)`, `@Transform(...)`) to coerce query string params to numbers/booleans.

### Service method type aliases (`Params` / `Return`)

For endpoint-style DTO files (named after the operation, e.g. `create-customer.dto.ts`), export two extra type aliases so the service signature has one source of truth for its param/return shape instead of repeating DTO/response types inline:

```typescript
export type ApiV1{Operation}Params = ApiV1{Operation}BodyDto;
export type ApiV1{Operation}Return = Promise<ApiV1{Operation}Response>;
```

```typescript
// service
async {operation}({ name, ... }: ApiV1{Operation}Params): ApiV1{Operation}Return { ... }
```

Add both whenever a DTO file is 1:1 with a single service method (body + response colocated). Skip for pure shared/reusable DTOs (`{Entity}ParamsDto` path params, `List{Entity}QueryDto`) not tied to one method. Full pattern: [dto-organization.docs.md](../dto-organization.docs.md#service-method-type-aliases-params--return).

## Pagination

Full guide: [list-api-pagination.docs.md](../list-api-pagination.docs.md). Summary:

- List endpoints are `POST {resource}/list` with a **body** DTO (not `GET` + `@Query()`), composed from the shared `BasePaginationInputDto` (`page`, `limit`, `noLimit`) and `BaseSortsFiltersDto` (`sorts: SortFieldDto[]`, `q`) via `IntersectionType`/`PickType` — don't redeclare these fields per entity.
- 1-based `page`, default `page=1`/`limit=10`, `limit` capped at 1000; `noLimit: true` bypasses pagination entirely (skip the count query and omit `metadata` from the response in that case).
- Validate `sorts[].field` against an explicit per-entity allow-list before building Prisma `orderBy` — never pass a client-supplied field straight into `orderBy`.
- Optionally support an `included` fields whitelist (typed from a `const ... satisfies readonly (keyof ItemDto)[]` array) so clients can select a subset of response fields.
- Service runs the data query and `count` query in parallel (`Promise.all`, count skipped when `noLimit`) and returns the standard `PaginationDto` shape: `page`, `limit`, `currentRecords`, `totalRecords`, `totalPages`, `hasNextPage`, `hasPrevPage`.
- Support case-insensitive `q` search (`mode: 'insensitive'`).
- List endpoints in this repo catch errors internally and return a `success: false` envelope with empty data, rather than letting the error reach the global filter — match this for consistency with existing list endpoints.

## Adding a new endpoint — checklist

1. Define/extend DTOs in `dto/` following the naming table above.
2. Add the controller method: versioned route, `@ApiTags`/`@ApiOperation`/`@ApiResponse`/`@ApiCommonErrorsResponse()`, typed return.
3. Implement the service method; return `{ data, message?, metadata? }` — do not wrap manually.
4. If it's a list endpoint, follow the pagination pattern above.
5. Add unit tests for the service and (if behavior-significant) an e2e test for the route — see [07-testing-rules.md](./07-testing-rules.md) / [10-e2e-test-instruction.md](./10-e2e-test-instruction.md).