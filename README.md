# PartyTab

PartyTab is a lightweight shared-expense tracker for temporary group events.
Track expenses as they happen, and settle once at the end.

## Prerequisites

- Node v24.11.1
- npm v11.6.2

## Local Development

```bash
npm run dev
```

Visit http://localhost:3000.

## Local Database (Offline)

Use the bundled Postgres container:

```bash
npm run db:up
```

Then set:

```
DATABASE_URL_LOCAL="postgresql://postgres:postgres@localhost:5433/partytab"
```

Run migrations and seed data:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Reset the DB + seed:

```bash
npm run db:reset
```

## Migrations

Local dev uses Prisma migrations:

```bash
npm run db:migrate
```

Production deploy uses:

```bash
npm run db:deploy
```

## Environment Variables

Create a `.env` file based on `.env.example` and set:

- `DATABASE_URL`
- `DATABASE_URL_LOCAL` (optional, local docker)
- `SESSION_SECRET`
- `APP_BASE_URL`

`DIRECT_URL` is optional for Prisma migrations.

Optional (receipt upload + parsing):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

## Testing

Tests use Vitest and run in Node.

```bash
npm run test
```

Optional:

- `SMOKE_BASE_URL=http://localhost:3000` to run API contract tests.
- `RUN_DB_TESTS=true` to run DB-backed acknowledgement tests (requires `DATABASE_URL`).

## Dev Checklist

- `npm run db:up`
- `npm run db:reset`
- `npm run dev`
- `npm run smoke` (set `SMOKE_BASE_URL` if needed)

## Demo Mode (dev-only)

- Visit `/demo` to reset demo data and jump to seeded tabs.

## TODO

- [ ] **Upstash Redis** - Set up distributed rate limiting for production
  - Create free account at [upstash.com](https://upstash.com)
  - Add to Vercel env vars: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
  - Priority: Low (in-memory fallback works, just resets on cold start)
