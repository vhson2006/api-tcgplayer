---
name: new-module
description: Scaffold a new NestJS feature module in this repo (module/controller/service/dto files) following this codebase's conventions. Use when adding a new resource/endpoint group under src/modules/.
argument-hint: [module-name]
---

Scaffold a new feature module named `$ARGUMENTS` under `src/modules/<module-name>/` following this repo's conventions (see `docs/ai/02-architecture-rules.md` and `docs/ai/03-nestjs-rules.md` for full rules — read them before generating code).

Steps:

1. Create `src/modules/<module-name>/<module-name>.module.ts`, `.controller.ts`, `.service.ts`, and a `dto/` folder.
2. Controller: versioned route (`@Controller({ path: '<module-name>', version: '1' })`), `@ApiTags`, one example endpoint with `@ApiOperation`/`@ApiResponse`/`@ApiCommonErrorsResponse()`, delegating to the service. No Prisma/business logic in the controller.
3. Service: constructor-inject only the Prisma service(s) actually needed (see `docs/ai/04-database-rules.md` for which schema client to use). Return `{ data, message?, metadata? }` — never build the response envelope manually (`docs/ai/05-api-rules.md`).
4. DTOs: follow the naming table in `docs/ai/05-api-rules.md` / `docs/dto-organization.docs.md` (`List{Entity}QueryDto`, `Create{Entity}Dto`, `{Entity}ResponseDto`, `ApiV1{Entity}ResponseDto`, ...), with `class-validator`/`@ApiProperty` decorators.
5. Register the module in the correct app module (`src/app.module.ts` for the main API, `src/app-crm.module.ts` for CRM, or a worker module) — ask which one if it's not obvious from the request.
6. Add a unit test for the service and an e2e test for the endpoint (see `docs/ai/07-testing-rules.md`, `docs/ai/10-e2e-test-instruction.md`).

Do not skip Swagger documentation or DTO validation even for a quick scaffold.
