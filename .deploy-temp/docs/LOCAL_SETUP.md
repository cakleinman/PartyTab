# Local Setup

## Prerequisites

- Node v24.11.1
- npm v11.6.2
- Docker (for local Postgres)

## Clean Install

```bash
rm -rf node_modules .next
npm install
```

## Environment

Copy `.env.example` to `.env` and set at least:

- `DATABASE_URL` or `DATABASE_URL_LOCAL`
- `SESSION_SECRET`
- `APP_BASE_URL`

## Local Database

```bash
npm run db:up
npm run db:generate
npm run db:migrate
npm run db:seed
```

Reset everything:

```bash
npm run db:reset
```

## Run the App

```bash
npm run dev
```

Visit http://localhost:3000.

## Smoke Test

```bash
SMOKE_BASE_URL=http://localhost:3000 npm run smoke
```
