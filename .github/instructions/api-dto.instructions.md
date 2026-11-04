---
description: 'API response envelope, DTO naming, and pagination conventions for this repo. Use when writing or modifying DTOs, controller endpoints, or list/pagination logic.'
applyTo: 'src/**/dto/**,src/**/dtos/**,src/shared/dtos/**'
---

# API / DTO Conventions

Full rules: [docs/ai/05-api-rules.md](../../docs/ai/05-api-rules.md), [docs/dto-organization.docs.md](../../docs/dto-organization.docs.md), [docs/list-api-pagination.docs.md](../../docs/list-api-pagination.docs.md).

- Responses are wrapped by the global `ResponseInterceptor` into `BaseResponseDto<T>` (`success`, `messages`, `data`, `metadata`, `timestamp`). Services/controllers return `{ data, message?, metadata? }` — never build the envelope by hand.
- DTO naming per entity: `List{Entity}QueryDto`, `Create{Entity}Dto`, `Update{Entity}Dto` (via `PartialType`), `{Entity}ResponseDto`, `{Entity}ParamsDto`, `ApiV1{Entity}ResponseDto` (list), `ApiV1{Entity}SingleResponseDto` (single).
- Every field needs `@ApiProperty`/`@ApiPropertyOptional` + `class-validator` decorators; use `class-transformer` (`@Type(() => Number)`, `@Transform(...)`) to coerce query params.
- Pagination: list endpoints are `POST {resource}/list` with a **body** DTO composed from shared `BasePaginationInputDto` (`page`/`limit`/`noLimit`) + `BaseSortsFiltersDto` (`sorts`/`q`) via `IntersectionType`/`PickType` — not `GET`+`@Query()`. 1-based `page`, `limit` capped at 1000, parallel `findMany`+`count` (skip count when `noLimit`), standard `PaginationDto` fields (omit `metadata` entirely when `noLimit`). Validate `sorts[].field` against an allow-list before use. See `docs/list-api-pagination.docs.md`.
- Reuse `BaseResponseDto`/`PaginationDto` from `src/shared/dtos/` — don't redefine the shape per module.
- For single-endpoint DTO files (named after the operation, e.g. `create-customer.dto.ts`), also export `ApiV1{Operation}Params = ApiV1{Operation}BodyDto` and `ApiV1{Operation}Return = Promise<ApiV1{Operation}Response>` type aliases, and use them as the service method's param/return type (see `docs/dto-organization.docs.md`).
