# PartyTab Remediation Spec

**Project:** PartyTab (expense-splitting app)
**Created:** February 2, 2026
**Purpose:** Guide for completing remaining audit remediation tasks

---

## Project Context

PartyTab is a Next.js 16 application with the following stack:
- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5.9
- **Database:** PostgreSQL via Supabase, Prisma ORM
- **Auth:** NextAuth v5 (beta) with Google, Apple, email providers
- **Payments:** Stripe
- **Hosting:** Vercel

The codebase follows feature-based organization with business logic separated into `/lib/`. A security audit was completed on February 2, 2026 — credentials have been rotated and environment hygiene is confirmed.

---

## Remaining Tasks

### Task 1: Remove Build Artifacts from Repository

**Priority:** High
**Estimated effort:** 15 minutes

**Problem:**
`.next/` and `.deploy-temp/` directories may be tracked in git. These are build outputs that bloat the repository and can cause deployment issues.

**Specification:**

1. Check if these directories are tracked:
   ```bash
   git ls-files | grep -E "^\.next/|^\.deploy-temp/"
   ```

2. If tracked, remove them from git (but keep locally):
   ```bash
   git rm -r --cached .next/ .deploy-temp/
   ```

3. Verify `.gitignore` includes these entries:
   ```
   .next/
   .deploy-temp/
   ```

4. Commit the removal:
   ```bash
   git commit -m "chore: remove build artifacts from version control"
   ```

**Acceptance criteria:**
- [ ] `git ls-files | grep -E "^\.next/|^\.deploy-temp/"` returns empty
- [ ] `.gitignore` contains both entries
- [ ] Build still works (`npm run build`)

---

### Task 2: Set Up CI/CD Pipeline (GitHub Actions)

**Priority:** High
**Estimated effort:** 30 minutes

**Problem:**
No automated quality gates exist. Code can be merged without passing lint, typecheck, or tests.

**Specification:**

Create `.github/workflows/ci.yml` with the following jobs:

1. **Lint** — Run `npm run lint`
2. **Type Check** — Run `npm run typecheck`
3. **Unit Tests** — Run `npm run test`
4. **Build Verification** — Run `npm run build` (without Prisma generate, as no DB access in CI)

**Requirements:**
- Trigger on: `push` to `main`, `pull_request` to `main`
- Use Node.js 20
- Cache `node_modules` for performance
- All jobs should run in parallel where possible
- Fail the workflow if any job fails

**Environment considerations:**
- CI does not have database access — skip Prisma generate in build or mock it
- Set required environment variables as GitHub secrets or use dummy values for type-checking

**Suggested workflow structure:**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

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
```

**Acceptance criteria:**
- [ ] `.github/workflows/ci.yml` exists and is valid YAML
- [ ] Workflow runs successfully on push/PR
- [ ] All three checks (lint, typecheck, test) pass
- [ ] Failed checks block PR merge (configure in GitHub branch protection settings)

---

### Task 3: Add End-to-End Tests (Playwright)

**Priority:** High
**Estimated effort:** 1-2 hours

**Problem:**
No E2E tests exist. Unit tests cover business logic, but user flows are untested.

**Specification:**

1. **Install Playwright:**
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. **Create Playwright config** (`playwright.config.ts`):
   - Base URL: `http://localhost:3000`
   - Test directory: `e2e/`
   - Browsers: Chromium only (for speed in CI)
   - Retries: 2 in CI, 0 locally

3. **Add npm scripts** to `package.json`:
   ```json
   {
     "test:e2e": "playwright test",
     "test:e2e:ui": "playwright test --ui"
   }
   ```

4. **Create initial E2E tests** covering critical user flows:

   | Test File | Flow to Test |
   |-----------|--------------|
   | `e2e/landing.spec.ts` | Landing page loads, CTA visible |
   | `e2e/auth.spec.ts` | Sign-in page accessible, OAuth buttons present |
   | `e2e/tab-creation.spec.ts` | Authenticated user can create a new tab |

5. **Add to CI workflow** (new job, runs after build):
   ```yaml
   e2e:
     runs-on: ubuntu-latest
     needs: [lint, typecheck, test]
     steps:
       - uses: actions/checkout@v4
       - uses: actions/setup-node@v4
         with:
           node-version: '20'
           cache: 'npm'
       - run: npm ci
       - run: npx playwright install --with-deps chromium
       - run: npm run build
       - run: npm run test:e2e
   ```

**Notes:**
- E2E tests requiring auth should use Playwright's `storageState` for session persistence
- Consider using a test database or mocking API responses for isolation
- Start with smoke tests, expand coverage over time

**Acceptance criteria:**
- [ ] `playwright.config.ts` exists with sensible defaults
- [ ] At least 3 E2E test files exist in `e2e/` directory
- [ ] `npm run test:e2e` passes locally
- [ ] E2E tests run in CI (can be optional/non-blocking initially)

---

### Task 4: Fix ESLint Errors

**Priority:** Medium
**Estimated effort:** 15 minutes

**Problem:**
4 ESLint errors exist that should be fixed:

| File | Error | Fix |
|------|-------|-----|
| `app/api/save-image/route.ts` | `@typescript-eslint/no-explicit-any` | Add proper type annotation |
| `app/marketing-assets/page.tsx` | `@typescript-eslint/ban-ts-comment` (x3) | Replace `@ts-ignore` with `@ts-expect-error` |

**Specification:**

1. Run `npm run lint` to confirm current errors

2. Fix `app/api/save-image/route.ts`:
   - Find the `any` type usage
   - Replace with appropriate type (likely `unknown` or a specific interface)

3. Fix `app/marketing-assets/page.tsx`:
   - Find all `// @ts-ignore` comments
   - Replace each with `// @ts-expect-error <reason>` where `<reason>` explains why the error is expected

4. Run `npm run lint` again to confirm 0 errors

**Acceptance criteria:**
- [ ] `npm run lint` exits with code 0
- [ ] No `@ts-ignore` comments remain (only `@ts-expect-error` if needed)
- [ ] No `any` types without explicit justification

---

### Task 5: Standardize API Response Shapes

**Priority:** Medium
**Estimated effort:** 1 hour

**Problem:**
API endpoints return inconsistent response shapes:
- Some use `{ data: {...} }`
- Some use `{ expenses: [...] }` or other entity-specific keys
- Error handling varies

**Specification:**

1. **Define standard response envelope** in `lib/api/response.ts`:

   ```typescript
   // Success response
   type ApiResponse<T> = {
     success: true;
     data: T;
   };

   // Error response
   type ApiErrorResponse = {
     success: false;
     error: {
       code: string;
       message: string;
     };
   };

   // Helper functions
   export function successResponse<T>(data: T): NextResponse<ApiResponse<T>>;
   export function errorResponse(code: string, message: string, status?: number): NextResponse<ApiErrorResponse>;
   ```

2. **Audit existing API routes** in `app/api/`:
   - List all routes and their current response shapes
   - Identify which need updating

3. **Update routes incrementally:**
   - Start with most-used endpoints
   - Ensure backward compatibility if mobile clients exist
   - Update corresponding TypeScript types

4. **Update frontend fetch calls** to handle new shape

**Notes:**
- This is a potentially breaking change if clients depend on current shapes
- Consider versioning the API (`/api/v2/`) if backward compatibility is critical
- Document the standard in a README or API docs

**Acceptance criteria:**
- [ ] `lib/api/response.ts` exists with helper functions
- [ ] At least 5 key API routes use the new standard
- [ ] Frontend handles the new response shape
- [ ] No runtime errors after changes

---

### Task 6: Monitor NextAuth v5 Stable Release

**Priority:** Medium
**Estimated effort:** Ongoing (no immediate action)

**Problem:**
Currently using `next-auth@5.0.0-beta.30` which is pre-release software.

**Specification:**

1. **No immediate code changes required**

2. **Set up monitoring:**
   - Watch the NextAuth GitHub releases: https://github.com/nextauthjs/next-auth/releases
   - Subscribe to the NextAuth Discord or Twitter for announcements

3. **When v5 stable releases:**
   - Review the changelog for breaking changes
   - Update `package.json` to stable version
   - Run full test suite
   - Test all auth flows manually (Google, Apple, email sign-in)

**Acceptance criteria:**
- [ ] Team is aware of the beta dependency
- [ ] Plan exists for upgrading when stable releases

---

### Task 7: Move Large Marketing Assets to External Storage

**Priority:** Low
**Estimated effort:** 30 minutes

**Problem:**
The `marketing/` folder is 223MB, bloating the repository.

**Specification:**

1. **Assess contents:**
   - What file types? (videos, images, PSDs?)
   - Are they actively used in the build?
   - Are they source files or generated outputs?

2. **Choose storage solution:**
   - **Option A:** Vercel Blob Storage (integrated, simple)
   - **Option B:** Supabase Storage (already using Supabase)
   - **Option C:** Separate git repo with Git LFS
   - **Option D:** Cloud storage (S3, Cloudflare R2)

3. **Migration steps:**
   - Upload assets to chosen storage
   - Update any code references to use new URLs
   - Remove from git: `git rm -r --cached marketing/`
   - Add to `.gitignore`
   - Commit removal

4. **If assets are needed for builds:**
   - Add download step to CI
   - Or reference via CDN URLs

**Acceptance criteria:**
- [ ] `marketing/` folder removed from git tracking
- [ ] Assets accessible from external storage
- [ ] Repository size reduced significantly
- [ ] Any build/deploy processes still work

---

## Execution Order

Recommended sequence for completing these tasks:

```
1. Task 1: Remove Build Artifacts     [15 min]  — Quick win, reduces repo size
2. Task 4: Fix ESLint Errors          [15 min]  — Quick win, improves CI readiness
3. Task 2: Set Up CI/CD               [30 min]  — Foundation for quality gates
4. Task 3: Add E2E Tests              [1-2 hrs] — Builds on CI infrastructure
5. Task 5: Standardize API Responses  [1 hr]    — Code quality improvement
6. Task 7: Move Marketing Assets      [30 min]  — Housekeeping
7. Task 6: Monitor NextAuth           [ongoing] — No immediate action
```

**Total estimated effort:** 3-4 hours

---

## Notes for Executing Agent

- **Always run `npm run lint` and `npm run typecheck` after changes** to ensure no regressions
- **Commit incrementally** — one commit per task, with descriptive messages
- **Test locally before pushing** — especially for CI workflow changes
- **The project uses Prisma** — run `npx prisma generate` if you see type errors related to the database client
- **Vercel deploys automatically on push to main** — be mindful of this for breaking changes

---

*Spec created February 2, 2026*
