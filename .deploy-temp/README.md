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

## Environment Variables

Create a `.env` file based on `.env.example` and set:

- `DATABASE_URL`
- `DATABASE_URL_LOCAL` (optional, local docker)
- `SESSION_SECRET`
- `APP_BASE_URL`

`DIRECT_URL` is optional for Prisma migrations.

## Testing

Tests use Vitest and run in Node.

```bash
npm run test
```

## Dev Checklist

- `npm run db:up`
- `npm run db:reset`
- `npm run dev`
- `npm run smoke` (set `SMOKE_BASE_URL` if needed)

## Demo Mode (dev-only)

- Visit `/demo` to reset demo data and jump to seeded tabs.
