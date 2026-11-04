# DTO Organization Guidelines

Organize DTOs (Data Transfer Objects) and types in the `dto/` directory within each module.

## Directory Structure

```
src/
├── shared/
│   └── dtos/
│       ├── base-response.dto.ts    # Base API response structure
│       └── pagination.dto.ts       # Standard pagination metadata
└── modules/
    └── {module}/
        └── dto/
            ├── {entity}.dto.ts           # All DTOs for the entity
            └── {entity}-query.dto.ts     # Query/filter DTOs (if complex)
```

## Shared DTOs

Define reusable DTOs in `src/shared/dtos/`:

```typescript
// src/shared/dtos/pagination.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ example: 1, description: 'Current page number (1-based)' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit!: number;

  @ApiProperty({ example: 10, description: 'Records in current page' })
  currentRecords!: number;

  @ApiProperty({ example: 100, description: 'Total records available' })
  totalRecords!: number;

  @ApiProperty({ example: 10, description: 'Total pages' })
  totalPages!: number;

  @ApiProperty({ example: true, description: 'Has next page' })
  hasNextPage!: boolean;

  @ApiProperty({ example: false, description: 'Has previous page' })
  hasPrevPage!: boolean;
}
```

```typescript
// src/shared/dtos/base-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';

export class BaseResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ isArray: true })
  messages: string[];

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  metadata?: PaginationDto;

  @ApiProperty()
  timestamp: string;
}
```

## Module DTOs

Define all DTOs for an entity in one file:

```typescript
// src/modules/{module}/dto/{entity}.dto.ts
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseResponseDto } from '@/shared/dtos/base-response.dto';

// === Query DTO (for list endpoints) ===
export class List{Entity}QueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by type' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: ['createdAt', 'updatedAt', 'name'] })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

// === Create DTO ===
export class Create{Entity}Dto {
  @ApiProperty({ description: 'Name', example: 'My Entity' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// === Update DTO (partial of Create) ===
export class Update{Entity}Dto extends PartialType(Create{Entity}Dto) {}

// === Response DTO ===
export class {Entity}ResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

// === Params DTO (for path parameters) ===
export class {Entity}ParamsDto {
  @ApiProperty({ description: 'Entity ID' })
  @IsUUID()
  id!: string;
}

// === API Response DTOs ===
export class ApiV1{Entity}ResponseDto extends BaseResponseDto<{Entity}ResponseDto[]> {}
export class ApiV1{Entity}SingleResponseDto extends BaseResponseDto<{Entity}ResponseDto> {}

// === Service method type aliases (Params / Return) ===
export type ApiV1{Operation}Params = ApiV1{Operation}BodyDto;
export type ApiV1{Operation}Return = Promise<ApiV1{Operation}Response>;
```

## Service Method Type Aliases (`Params` / `Return`)

For endpoint-style DTO files (named after the operation, e.g. `create-customer.dto.ts`, `list-zendesk-tickets.dto.ts`), export two extra type aliases at the bottom of the file so the service method signature doesn't repeat the DTO/response types inline:

```typescript
// src/modules/{module}/dto/{operation}.dto.ts
export class ApiV1{Operation}BodyDto { /* ...request fields... */ }
export class ApiV1{Operation}Response extends BaseResponseDto<ApiV1{Operation}DataDto> {}

export type ApiV1{Operation}Params = ApiV1{Operation}BodyDto;
export type ApiV1{Operation}Return = Promise<ApiV1{Operation}Response>;
```

Import both into the service and use them as the method's parameter type and return type:

```typescript
// {module}.service.ts
import { ApiV1{Operation}Params, ApiV1{Operation}Return } from './dto/{operation}.dto';

async {operation}({ name, contactEmail /* ...destructured fields... */ }: ApiV1{Operation}Params): ApiV1{Operation}Return {
  // ...
}
```

- `{Operation}Params` aliases the request body (or query) DTO — used so the service can destructure the DTO directly in the parameter list without importing the body DTO class by name.
- `{Operation}Return` aliases `Promise<{Operation}Response>` — keeps the controller/service return type in sync with the documented Swagger response type with one source of truth.
- Add both aliases whenever a DTO file represents a single endpoint (body + response colocated). Skip them for pure shared/reusable DTOs (e.g. `{Entity}ParamsDto` path params, `List{Entity}QueryDto`) that aren't 1:1 with one service method.

## DTO Naming Conventions

| Purpose | Naming Pattern | Example |
|---------|---------------|---------|
| Query params | `List{Entity}QueryDto` | `ListUserQueryDto` |
| Create body | `Create{Entity}Dto` | `CreateUserDto` |
| Update body | `Update{Entity}Dto` | `UpdateUserDto` |
| Response item | `{Entity}ResponseDto` | `UserResponseDto` |
| Path params | `{Entity}ParamsDto` | `UserParamsDto` |
| List response | `ApiV1{Entity}ResponseDto` | `ApiV1UserResponseDto` |
| Single response | `ApiV1{Entity}SingleResponseDto` | `ApiV1UserSingleResponseDto` |
| Service method params (type alias) | `ApiV1{Operation}Params` | `ApiV1CreateCustomerParams` |
| Service method return (type alias) | `ApiV1{Operation}Return` | `ApiV1CreateCustomerReturn` |

## Validation Decorators

Common validation patterns:

```typescript
// String validation
@IsString()
@IsNotEmpty()
@MaxLength(255)
name!: string;

// Optional string
@IsString()
@IsOptional()
description?: string;

// UUID
@IsUUID()
id!: string;

// Boolean from query string
@Transform(({ value }) => value === 'true' || value === true)
@IsBoolean()
@IsOptional()
isActive?: boolean;

// Number from query string
@Type(() => Number)
@IsInt()
@Min(1)
@Max(100)
@IsOptional()
limit?: number = 10;

// Enum validation
@IsString()
@IsOptional()
@ApiPropertyOptional({ enum: ['asc', 'desc'] })
sortOrder?: 'asc' | 'desc';
```

## Best Practices

1. **Group DTOs by entity** - Keep all DTOs for one entity in one file
2. **Use class-validator** - Always validate incoming data
3. **Use class-transformer** - Transform query params (strings to numbers/booleans)
4. **Extend shared DTOs** - Use `BaseResponseDto` and `PaginationDto`
5. **Use PartialType** - Generate Update DTOs from Create DTOs
6. **Document with Swagger** - Use `@ApiProperty` for all fields
7. **Set sensible defaults** - Provide defaults for optional pagination params
8. **Use definite assignment** - Use `!` for required fields in response DTOs
