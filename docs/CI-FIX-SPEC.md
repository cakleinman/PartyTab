# CI Pipeline Fix Spec

**Task:** Fix failing GitHub Actions CI workflow
**Problem:** E2E job fails due to missing environment variables
**Goal:** All 4 CI jobs pass (lint, typecheck, test, e2e)

---

## Current Issues

1. **E2E job lacks environment variables** — The Next.js app requires `DATABASE_URL`, `SESSION_SECRET`, and `APP_BASE_URL` to build and run
2. **Redundant build step** — Workflow runs `npm run build` then Playwright runs `npm run dev`. Should use production build with `npm start` instead
3. **No GitHub Secrets configured** — CI has no access to required environment variables

---

## Part 1: Add GitHub Secrets

The user needs to add these secrets in GitHub repo settings:
**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value | Notes |
|-------------|-------|-------|
| `DATABASE_URL` | Supabase pooled connection string | From Vercel/Supabase dashboard |
| `SESSION_SECRET` | Random 32+ character string | Can generate with `openssl rand -base64 32` |
| `APP_BASE_URL` | `http://localhost:3000` | For CI testing purposes |
| `AUTH_SECRET` | Random 32+ character string | Required by NextAuth |

**Optional (for full integration tests):**
| Secret Name | Value |
|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

**Note:** For CI, you can use test/development credentials, not production. Or create a separate Supabase project for CI testing.

---

## Part 2: Update CI Workflow

Replace `.github/workflows/ci.yml` with the following:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  # Shared across all jobs - minimal env for Prisma generate
  DATABASE_URL: ${{ secrets.DATABASE_URL }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma generate
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma generate
      - run: npm run test

  e2e:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      SESSION_SECRET: ${{ secrets.SESSION_SECRET }}
      AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
      APP_BASE_URL: http://localhost:3000
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma generate
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run test:e2e
        env:
          CI: true
```

---

## Part 3: Update Playwright Config

The Playwright config needs to start the **production server** (not dev server) since we're building first.

Update `playwright.config.ts` webServer section:

```typescript
webServer: {
    command: 'npm run start',  // Changed from 'npm run dev'
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
},
```

---

## Part 4: Handle Missing Secrets Gracefully (Optional)

If you want CI to pass even when secrets aren't configured (e.g., for forks/external PRs), make E2E conditional:

```yaml
e2e:
  runs-on: ubuntu-latest
  needs: [lint, typecheck, test]
  if: ${{ secrets.DATABASE_URL != '' }}  # Only run if secrets exist
  # ... rest of job
```

---

## Verification Steps

1. **Add GitHub Secrets** (Part 1)
   - Go to repo Settings → Secrets → Actions
   - Add at minimum: `DATABASE_URL`, `SESSION_SECRET`, `AUTH_SECRET`

2. **Update workflow file** (Part 2)
   - Replace `.github/workflows/ci.yml` with new content

3. **Update Playwright config** (Part 3)
   - Change `npm run dev` to `npm run start` in webServer.command

4. **Commit and push**
   ```bash
   git add .github/workflows/ci.yml playwright.config.ts
   git commit -m "fix(ci): add environment variables and fix e2e server"
   git push
   ```

5. **Verify in GitHub Actions**
   - All 4 jobs should pass: lint ✓, typecheck ✓, test ✓, e2e ✓

---

## Troubleshooting

**If Prisma generate fails:**
- Ensure `DATABASE_URL` secret is set and valid
- The URL format should be: `postgresql://user:password@host:port/database`

**If build fails:**
- Check for other required env vars in build output
- Add missing vars to the e2e job's `env` section

**If E2E tests fail but server starts:**
- This is a test issue, not CI config issue
- Check Playwright test output for specific failures

**If server fails to start:**
- Check that all required env vars are set
- Verify `npm run start` works locally after `npm run build`

---

## Alternative: Skip E2E for Now

If you want to get CI green immediately without setting up secrets, you can make E2E optional:

```yaml
e2e:
  runs-on: ubuntu-latest
  needs: [lint, typecheck, test]
  if: ${{ vars.RUN_E2E == 'true' }}  # Disabled by default
  # ... rest of job
```

Then enable it later by adding a repository variable `RUN_E2E=true`.

---

## Summary

| Step | Action | Who |
|------|--------|-----|
| 1 | Add GitHub Secrets | User (manual in GitHub UI) |
| 2 | Update ci.yml | Agent |
| 3 | Update playwright.config.ts | Agent |
| 4 | Commit and push | Agent |
| 5 | Verify CI passes | User (check GitHub Actions) |

**Important:** Step 1 (adding secrets) must be done by the user in the GitHub web UI before CI will pass. The agent cannot add secrets programmatically.

---

*Spec created February 2, 2026*
