# List API Pagination Guidelines

When implementing list endpoints, follow this standard pattern (based on the real implementation in `src/modules/soc/dto/list-customers.dto.ts` / `soc.service.ts`).

List endpoints in this repo are **`POST {resource}/list` with a body DTO** (not `GET` + `@Query()`), because filters/sorts/included-fields are richer than a query string comfortably supports. Compose the body DTO from the shared pagination/sort DTOs instead of redefining `page`/`limit`/`sorts` per entity.

## Shared building blocks (`src/shared/dtos/`)

```typescript
// base-pagination-input-dto.ts
export class BasePaginationInputDto {
  page?: number = 1;       // 1-based
  limit?: number = 10;     // capped at 1000 by @Max
  noLimit?: boolean = false; // true = ignore pagination, return everything
}

// base-sorts-filters.dto.ts
export class SortFieldDto {
  field!: string;
  order!: SortOrder; // 'asc' | 'desc'
}

export class BaseSortsFiltersDto {
  sorts?: SortFieldDto[]; // array of sort rules, priority order
  q?: string;             // free-text search keyword (1-100 chars)
}
```

## Body DTO structure

Compose the list body DTO with `IntersectionType`/`PickType` from the shared DTOs, add an `included` fields whitelist (typed from a `satisfies readonly (keyof ItemDto)[]` const), and any entity-specific filters:

```typescript
// src/modules/{module}/dto/list-{entity}.dto.ts
import { ApiProperty, ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { BasePaginationInputDto } from '@/shared/dtos/base-pagination-input-dto';
import { BaseResponseDto } from '@/shared/dtos/base-response.dto';
import { BaseSortsFiltersDto, SortFieldDto } from '@/shared/dtos/base-sorts-filters.dto';
import { transformJsonQueryValue } from '@/shared/utils/query-transform.util';
import { ApiV1{Entity}ItemDto } from './{module}-shared.dto';

export const LIST_{ENTITY}_FIELDS = [
  'displayName',
  'customerId',
] as const satisfies readonly (keyof ApiV1{Entity}ItemDto)[];

export class ApiV1List{Entity}BodyDto extends IntersectionType(
  PickType(BasePaginationInputDto, ['limit', 'page', 'noLimit']),
  PickType(BaseSortsFiltersDto, ['sorts', 'q']),
) {
  // Re-declare `sorts` only if it needs a JSON-string-or-array query transform (see below)
  @ApiPropertyOptional({ type: [SortFieldDto], example: [{ field: 'displayName', order: 'asc' }] })
  @Transform(({ value }) => transformJsonQueryValue(value))
  @ValidateNested({ each: true })
  @Type(() => SortFieldDto)
  @IsArray()
  @IsOptional()
  declare sorts?: SortFieldDto[];

  @ApiPropertyOptional({
    description: 'Fields to include in each item (defaults to all fields)',
    enum: LIST_{ENTITY}_FIELDS,
    isArray: true,
  })
  @Transform(({ value }) => transformJsonQueryValue(value))
  @IsArray()
  @IsString({ each: true })
  @IsIn(LIST_{ENTITY}_FIELDS, { each: true })
  @IsOptional()
  included?: (typeof LIST_{ENTITY}_FIELDS)[number][];

  // Entity-specific filter(s)
  @ApiPropertyOptional({ example: 'ce791f42-a99f-4838-b69f-4362ea33fbc1' })
  @IsUUID()
  @IsOptional()
  customerId?: string;
}

class ApiV1List{Entity}DataDto {
  @ApiProperty({ type: [ApiV1{Entity}ItemDto] })
  {entities}!: ApiV1{Entity}ItemDto[];
}

export class ApiV1List{Entity}Response extends BaseResponseDto<ApiV1List{Entity}DataDto> {}

// Service method type aliases — see docs/dto-organization.docs.md
export type ApiV1List{Entity}Params = ApiV1List{Entity}BodyDto;
export type ApiV1List{Entity}Return = Promise<ApiV1List{Entity}Response>;
```

## Controller

```typescript
@Post('{entities}/list')
@ApiOperation({ summary: 'List {entities} with body filters' })
@ApiResponse({ status: 200, type: ApiV1List{Entity}Response, examples: { 200: { value: example200 } } })
@ApiCommonErrorsResponse()
@HttpCode(200)
list{Entity}(@Body() body: ApiV1List{Entity}BodyDto): ApiV1List{Entity}Return {
  return this.service.list{Entity}(body);
}
```

## Service pattern

Destructure the `Params` type alias directly in the method signature. Resolve pagination, validate/build sort order, build `where` from an `AND` array of optional filters, then run the data query and (only when pagination is active) a count query in parallel:

```typescript
async list{Entity}({
  page,
  limit,
  noLimit,
  q,
  sorts,
  included,
  customerId,
}: ApiV1List{Entity}Params): ApiV1List{Entity}Return {
  const pagination = this._resolvePagination(page, limit, noLimit);

  try {
    const sortValidation = this._buildOrderByFromSorts(sorts, {ENTITY}_SORT_FIELDS, (field, order) => ({ [field]: order }));
    if ('message' in sortValidation) {
      return { success: false, messages: [sortValidation.message], data: { {entities}: [] }, timestamp: new Date().toISOString() };
    }

    const filters: Prisma.{Entity}WhereInput[] = [];
    if (customerId) filters.push({ customerId });
    if (q) filters.push({ displayName: { contains: q, mode: 'insensitive' } });
    const where: Prisma.{Entity}WhereInput = filters.length ? { AND: filters } : {};
    const orderBy = sortValidation.orderBy ?? [{ displayName: 'asc' as const }];

    const [rows, totalRecords] = await Promise.all([
      this.prisma.{entity}.findMany({
        where,
        orderBy,
        ...(pagination.paginationEnabled ? { skip: pagination.offset, take: pagination.limit } : {}),
      }),
      pagination.paginationEnabled ? this.prisma.{entity}.count({ where }) : Promise.resolve(0),
    ]);

    const items = rows.map((row): ApiV1{Entity}ItemDto => ({ /* map row -> item dto */ }));
    const total = pagination.paginationEnabled ? totalRecords : items.length;
    const metadata = pagination.paginationEnabled
      ? this._buildMetadata(pagination.page, pagination.limit, items.length, total)
      : undefined;

    return {
      success: true,
      messages: ['{Entity} list retrieved successfully'],
      data: { {entities}: this._applyIncludedFields(items, included) },
      ...(metadata ? { metadata } : {}),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('List {entity} failed', undefined, CONTEXT, { page, limit, noLimit, q, error: error instanceof Error ? error.message : String(error) });
    return { success: false, messages: ['List {entity} failed'], data: { {entities}: [] }, timestamp: new Date().toISOString() };
  }
}
```

Notes:
- List endpoints in this codebase **catch internally and return a `success: false` envelope** with empty data on failure, rather than letting the error bubble to the global filter — match this pattern for consistency with existing list endpoints (see [06-error-handling-rules.md](./ai/06-error-handling-rules.md) for the general/default error-throwing rule used elsewhere).
- `_resolvePagination`, `_buildOrderByFromSorts`, `_buildMetadata`, `_applyIncludedFields` are typically implemented as small `private` helpers on the service itself (copy the pattern from an existing service such as `soc.service.ts` or `customers.service.ts`). Sort-field and included-field validation also has shared free-function equivalents in `src/shared/utils/service-handlers.utils.ts` (`sortsValidation`, `applyIncludedFields`) if you prefer not to duplicate the private helpers.
- Always validate `sorts[].field` against an explicit per-entity allow-list (e.g. `{ENTITY}_SORT_FIELDS`) before using it in `orderBy` — never pass a client-supplied field name straight into Prisma's `orderBy`.
- `included` lets the client select a subset of response fields; validate it with `@IsIn(LIST_{ENTITY}_FIELDS, { each: true })` against a `const ... satisfies readonly (keyof ItemDto)[]` array so it stays in sync with the item DTO's actual keys.
- When `noLimit` is true, skip the count query entirely (`Promise.resolve(0)` placeholder) and omit `metadata` from the response — don't compute pagination metadata for an unpaginated result set.

## Metadata structure

Use the standard `PaginationDto` from `src/shared/dtos/pagination.dto.ts` — only include it in the response when pagination is actually applied (omit the `metadata` key when `noLimit` is true):

```typescript
export class PaginationDto {
  page!: number;           // Current page (1-based)
  limit!: number;          // Items per page
  currentRecords!: number; // Records in current response
  totalRecords!: number;   // Total matching records
  totalPages!: number;     // Total pages available (0 when totalRecords is 0)
  hasNextPage!: boolean;   // page < totalPages
  hasPrevPage!: boolean;   // page > 1
}
```

## Best Practices

1. **Compose from shared DTOs** (`BasePaginationInputDto`, `BaseSortsFiltersDto`) via `IntersectionType`/`PickType` instead of redeclaring `page`/`limit`/`sorts` per entity.
2. **List endpoints are `POST {resource}/list` with a body DTO**, not `GET` + `@Query()`.
3. **Always use 1-based pagination**; respect `noLimit` to bypass pagination when requested.
4. **Cap maximum `limit`** (`@Max` on `BasePaginationInputDto`, currently 1000).
5. **Run the data query and count query in parallel** (`Promise.all`), and skip the count query when `noLimit` is true.
6. **Validate `sorts` fields against an explicit allow-list** before building Prisma `orderBy`; return a `success: false` response (not a thrown error) for an invalid sort field, matching existing list endpoints.
7. **Support `included` fields filtering** validated against a typed const array of the item DTO's keys.
8. **Support case-insensitive free-text search** (`q`) with `mode: 'insensitive'`.
9. **Omit `metadata` entirely** when pagination isn't applied.
10. **Export `ApiV1List{Entity}Params`/`ApiV1List{Entity}Return` type aliases** alongside the DTO (see [dto-organization.docs.md](./dto-organization.docs.md)).
