# API Controller Conventions

Conventions for writing NestJS controllers in this repo, based on the real implementation in `src/modules/crm/customers/customers.controller.ts`. Controllers stay thin: routing, decorators, Swagger docs, and DTO binding only — no business logic, no Prisma calls (see [docs/ai/03-nestjs-rules.md](./ai/03-nestjs-rules.md)).

## Class-level decorators

```typescript
@ApiTags('CRM Customers APIs')
@Controller({
  path: 'customers',
  version: '1',
})
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}
  // ...
}
```

- `@ApiTags('<Module> <SubResource> APIs')` — groups the controller in Swagger UI. Within a parent module, prefix with the module name, e.g. `CRM Customers APIs`, `CRM Users APIs`, `CRM Web Crawl APIs`, `CRM Customer Domain URLs APIs`. Standalone modules use a shorter tag (`SOC APIs`, `Maintenance`, `WSD Auth`) — match the style already used by sibling controllers in that module.
- `@Controller({ path: '<resource>', version: '1' })` — always use the object form with an explicit `version`, never the bare string form (`@Controller('customers')`) or `@Controller()` without a path. `path` is the plural, kebab/lowercase resource name (`customers`, `report-management`, `webpresencehealth`).
- Constructor-inject exactly one service (or a small, explicit set) — never inject a Prisma client directly into a controller.

## Route naming

| Action | HTTP verb | Path | Notes |
|---|---|---|---|
| List | `POST` | `list` (i.e. `POST /customers/list`) | Body-driven filters/pagination/sort — see [list-api-pagination.docs.md](./list-api-pagination.docs.md). Not `GET` — list filters are too rich for query strings. |
| Get one | `GET` | `:id` | Path param DTO, validated (`@IsUUID()` etc.). |
| Create | `POST` | `` (controller root) | Plain `@Post()` with no sub-path when it's the primary "create the resource" action. |
| Update | `PUT` | `:id` | Full/partial update by id. |
| Delete | `DELETE` | `:id` | Soft delete in this codebase (service marks `deleteFlag`/`deletedAt`, doesn't hard-delete). |
| Custom action | `POST` | `kebab-case-verb-phrase` | e.g. `create-org-existing-customers`. Use a `POST` + descriptive kebab-case sub-path for actions that aren't plain CRUD, rather than overloading an existing verb. |

- Prefer nesting an action under the resource path (`customers/list`) when the controller already owns `customers`; only use a fully custom top-level path (`customerconfigs/list`, as in `soc.controller.ts`) when the controller manages multiple distinct resources.
- Path params always go through a shared `Api V1{Resource}ParamDto`-style class (e.g. `ApiV1CustomerParamDto` in `customers-shared.dto.ts`) with `@IsUUID()` — never accept a raw `@Param('id') id: string`.

## Method decorator stack (order matters)

```typescript
@Post('create-org-existing-customers')
@ApiOperation({ summary: 'Create Keycloak organizations/users for existing customers' })
@ApiResponse({
  status: 200,
  type: ApiV1CreateOrgExistingCustomersResponse,
  examples: {
    200: {
      summary: 'Successful Response',
      value: apiV1CreateOrgExistingCustomersExample200,
    },
  },
  schema: {
    $ref: getSchemaPath(ApiV1CreateOrgExistingCustomersResponse),
  },
})
@ApiCommonErrorsResponse()
@HttpCode(200)
createOrgExistingCustomers(): Promise<ApiV1CreateOrgExistingCustomersResponse> {
  return this.customersService.createOrgExistingCustomers();
}
```

Always in this order:

1. HTTP method decorator (`@Post(...)`/`@Get(...)`/`@Put(...)`/`@Delete(...)`) with the sub-path (or none for the resource root).
2. `@ApiOperation({ summary: '<imperative summary>' })` — short, action-first summary (`'List customers'`, `'Create customer'`, `'Soft delete customer'`).
3. `@ApiResponse({ status, type, examples: { <status>: { summary, value } }, schema: { $ref: getSchemaPath(<ResponseDto>) } })` — always include `type`, a keyed `examples` object, and the `schema.$ref` via `getSchemaPath` so Swagger renders both the shape and a realistic example.
4. `@ApiCommonErrorsResponse()` — shared decorator (`src/shared/decorators/api-common-errors-response.decorator.ts`) that documents the standard `401` and `500` envelope responses. Add to every endpoint; don't hand-roll `@ApiUnauthorizedResponse`/`@ApiInternalServerErrorResponse` per controller.
5. `@HttpCode(<status>)` — set explicitly even when it matches the Nest default, so the decorator and the documented `@ApiResponse.status` never drift apart. Use `201` for `create`-type actions returning a newly created resource, `200` for everything else (list/get/update/delete/custom actions), matching the corresponding `@ApiResponse status`.

## Swagger response examples (`docs/` subfolder)

Keep example payloads out of the controller file. Put them in a sibling `docs/` folder, one file per operation:

```
src/modules/crm/customers/
├── customers.controller.ts
└── docs/
    ├── create-customer-examples.docs.ts
    ├── get-customer-examples.docs.ts
    ├── list-customers-examples.docs.ts
    ├── update-customer-examples.docs.ts
    └── delete-customer-examples.docs.ts
```

```typescript
// docs/create-customer-examples.docs.ts
import { ApiV1CreateCustomerResponse } from '../dto/create-customer.dto';

export const apiV1CreateCustomerExample201Message = 'Customer created successfully';

export const apiV1CreateCustomerExample201: ApiV1CreateCustomerResponse = {
  success: true,
  messages: [apiV1CreateCustomerExample201Message],
  data: { customer: { /* realistic field values, not placeholders */ } },
  timestamp: new Date().toISOString(),
};
```

- File name: `<operation>-examples.docs.ts`, colocated under the module's `docs/` folder.
- Export name: `apiV1{Operation}Example{StatusCode}` (e.g. `apiV1CreateCustomerExample201`, `apiV1ListCustomersExample200`), typed as the real response DTO (`ApiV1{Operation}Response`) so the example can't drift from the DTO shape.
- Also export the message string as `apiV1{Operation}Example{StatusCode}Message` when the service reuses that exact string in its real response `messages` array (keeps the doc example and the runtime message in sync).
- Use realistic example values (real-looking UUIDs, dates, emails) — this is what renders in Swagger UI, not internal test fixtures.

## Method signature conventions

```typescript
create(
  @Body() body: ApiV1CreateCustomerBodyDto,
  @Req() req: Request,
): Promise<ApiV1CreateCustomerResponse> {
  return this.customersService.createCustomer(body, toAuditRequestContext(req));
}

update(
  @Param() param: ApiV1CustomerParamDto,
  @Body() body: ApiV1UpdateCustomerBodyDto,
  @Req() req: Request,
): Promise<ApiV1UpdateCustomerResponse> {
  return this.customersService.updateCustomer({ ...param, ...body }, toAuditRequestContext(req));
}
```

- Bind the whole DTO with `@Param()`/`@Body()` (not individual `@Param('id')`/`@Body('field')` picks) so `class-validator`/`class-transformer` run against the full class.
- When both path params and a body are needed, merge them into a single object (`{ ...param, ...body }`) before calling the service, rather than passing two separate arguments the service has to reassemble.
- Inject `@Req() req: Request` only when the service needs request/audit metadata, and immediately convert it via a shared helper (`toAuditRequestContext(req)` in `src/modules/crm/audit/audit-request-context.util.ts`) — never pass the raw Express `Request` into the service layer.
- Return type is always the concrete `Promise<ApiV1{Operation}Response>` (or the plain `ApiV1{Operation}Response` if the DTO's `Return` type alias already wraps it — see [dto-organization.docs.md](./dto-organization.docs.md#service-method-type-aliases-params--return)), matching the `@ApiResponse.type`.
- The controller method body is a single line: validate nothing itself, just forward to the service.

## Best practices checklist

- [ ] `@ApiTags` matches the module's existing tag style; `@Controller({ path, version: '1' })` uses the object form.
- [ ] Every route has `@ApiOperation`, a typed `@ApiResponse` with `examples` + `schema.$ref`, `@ApiCommonErrorsResponse()`, and an explicit `@HttpCode` matching the documented status.
- [ ] List endpoints are `POST <resource>/list` with a body DTO, not `GET` + query params.
- [ ] Path params use a shared, validated `*ParamDto`, never a raw `@Param('id')`.
- [ ] Response examples live in `docs/<operation>-examples.docs.ts`, typed as the real response DTO, named `apiV1{Operation}Example{StatusCode}`.
- [ ] No business logic, Prisma access, or manual envelope construction in the controller — delegate everything to the service and return its result directly.
- [ ] Request/audit metadata is converted via the shared util (`toAuditRequestContext`) before reaching the service, not passed as a raw `Request`.
