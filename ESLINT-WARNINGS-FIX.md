# ESLint Warnings Fix Spec

**Task:** Fix all 11 remaining ESLint warnings
**Estimated effort:** 15 minutes
**Goal:** `npm run lint` returns 0 errors AND 0 warnings

---

## Warnings to Fix

### 1. `app/how-it-works/page.tsx` (1 warning)

| Line | Variable | Issue |
|------|----------|-------|
| 114:39 | `i` | Defined but never used |

**Fix:** This is likely an unused loop index. Either:
- Prefix with underscore: `_i` (convention for intentionally unused)
- Remove if not needed in the loop

---

### 2. `marketing/campaigns/social-video-launch/video-generator/src/categorize-video.js` (3 warnings)

| Line | Variable | Issue |
|------|----------|-------|
| 40:12 | `e` | Defined but never used |
| 57:14 | `e` | Defined but never used |
| 144:12 | `error` | Defined but never used |

**Fix:** These are likely catch block parameters. Options:
- Remove the parameter if error details aren't needed: `catch {` (JS allows empty catch)
- Prefix with underscore: `catch (_e) {`
- Actually use the error (log it, rethrow it, etc.)

---

### 3. `marketing/campaigns/social-video-launch/video-generator/src/generate-videos.js` (3 warnings)

| Line | Variable | Issue |
|------|----------|-------|
| 140:16 | `getVideoDuration` | Defined but never used |
| 146:12 | `error` | Defined but never used |
| 198:14 | `error` | Defined but never used |

**Fix:**
- `getVideoDuration`: Remove the function if unused, or add `// eslint-disable-next-line @typescript-eslint/no-unused-vars` if it's intentionally kept for future use
- `error` variables: Same as above — prefix with `_` or remove from catch

---

### 4. `marketing/campaigns/social-video-launch/video-generator/src/record-demo.js` (2 warnings)

| Line | Variable | Issue |
|------|----------|-------|
| 30:56 | `options` | Assigned but never used |
| 93:13 | `addButton` | Assigned but never used |

**Fix:**
- If these are destructured but unused, either remove them from destructuring or prefix with `_`
- If they're standalone assignments, remove the assignment or use the value

---

### 5. `tests/email/client.test.ts` (1 warning)

| Line | Variable | Issue |
|------|----------|-------|
| 1:20 | `expect` | Defined but never used |

**Fix:** This is an unused import. Either:
- Remove the import if not needed
- Use `expect` in the tests (it may be needed but not yet used)

---

### 6. `tests/notifications/create.test.ts` (1 warning)

| Line | Variable | Issue |
|------|----------|-------|
| 90:15 | `result` | Assigned but never used |

**Fix:** Either:
- Add an assertion using `result`: `expect(result).toBeDefined()` or similar
- Remove the assignment if the return value isn't needed: just call the function without storing result

---

## Fix Patterns Reference

### Unused loop index
```javascript
// Before
items.forEach((item, i) => { ... })

// After (if i is unused)
items.forEach((item, _i) => { ... })
// OR
items.forEach((item) => { ... })
```

### Unused catch parameter
```javascript
// Before
try { ... } catch (e) { console.log('failed') }

// After
try { ... } catch (_e) { console.log('failed') }
// OR (modern JS)
try { ... } catch { console.log('failed') }
```

### Unused import
```typescript
// Before
import { expect, describe, it } from 'vitest'

// After (if expect unused)
import { describe, it } from 'vitest'
```

### Unused function
```javascript
// Before
function getVideoDuration() { ... }

// After (if intentionally keeping for later)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getVideoDuration() { ... }

// OR just delete the function
```

### Unused destructured variable
```javascript
// Before
const { options, other } = config

// After (if options unused)
const { options: _options, other } = config
// OR
const { other } = config
```

---

## Verification

After fixing all warnings, run:

```bash
npm run lint
```

**Expected output:**
```
✔ No problems found
```

Or at minimum: `0 errors, 0 warnings`

---

## Commit Message

```
chore: fix remaining ESLint warnings

- Remove/prefix unused variables in marketing video scripts
- Clean up unused imports in test files
- Fix unused loop index in how-it-works page
```
