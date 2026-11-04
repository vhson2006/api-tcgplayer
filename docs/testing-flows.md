# Unit Testing

For snapshot retention and WCM partition backfill rollout execution, see [docs/modules/reporting/retention-flows.docs.md](modules/reporting/retention-flows.docs.md).

- Just run:

```bash
npm run test:unit
```

# Integration Testing

- Just run:

```bash
npm run test:integration
```

# E2E Testing

## 1) Run E2E tests locally

- Make sure `.env.test` exists.
  - If it doesn’t, create it by copying from `.env.test.sample`.

- Create a PostgreSQL user named `webyith_reporting_test` in your local PostgreSQL instance.
  - This user will be used to create the test databases automatically.

- Update the database credentials in `.env.test` (username/password in your database URLs).
  - You do not need to care about the database names — the test runner will create the databases automatically.

- Run the E2E tests:

```bash
npm run test:e2e
```

> **Important:** Make sure required services (PostgreSQL, Redis) are running locally.  
> If your `.env.test` points to remote hosts/VMs, E2E tests may fail.

---

## 2) Run E2E tests with Docker

- Follow the same setup steps as the local run:
  - Prepare `.env.test`
  - Update credentials if needed

- Update host values in `.env.test` to use Docker network hostnames (container service names) instead of `localhost`.

- Start the test infrastructure:

```bash
docker compose -f docker-compose.test.yaml --env-file .env.test up -d --build
```

Tip: Rename .env.test to .env.test.local (so Git won’t track the change). If you don’t want tests to run with the test config, do this—.env will be loaded first and take priority.

# All tests (unit, integration, e2e) can be run together with:

- The steps same e2e testing

```bash
npm run test
```
