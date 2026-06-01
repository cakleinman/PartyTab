# PartyTab — SEO Action Plan

**Generated:** 2026-05-31 · **Health Score:** 79 → **86/100** after remediation · Prioritized: Critical → High → Medium → Low

## ✅ Completed 2026-06-01

- **C1** — 5 thin use-case pages expanded (deep-dive prose + FAQ/FAQPage schema) — `830a3f1`
- **C2** — sitewide Organization + WebSite schema — `5b17965`
- **H1** — double-encoded meta-description entities (7 posts) — `5b17965`
- **H2** — BlogPosting `image` + `publisher.logo` — `5b17965`
- **H3** — www → apex 308 redirect — `5b17965`
- **H4** — 30 over-length titles trimmed — `6743e3a`
- **H5** — Pro Product/Offer markup on /upgrade — `5b17965`
- **Bonus (a11y)** — WCAG AA contrast restored on dark CTAs sitewide (65 pages) + 1 heading-order fix — `34df348` `a9070d3` `cb0447a` `239034a`
- **Verification** — Google PSI/CrUX API configured; CWV verified (Perf 97–100, A11y 100, BP 100, SEO 100). CrUX field data N/A (traffic threshold).

### Remaining (not yet done)

- **H6** — named human authors + linked citations on blog (E-E-A-T)
- **M1** — investigate blog-route raw TTFB (lab Perf is fine; field data pending traffic)
- **M3** — cannibalization clusters (group-dinner, split-rent)
- **M5** — BreadcrumbList on /how-it-works, /upgrade, /compare; ItemList on index pages
- **M6** — expand /compare/splitwise prose (~330 words)
- **M7** — human-facing About/Organization page
- **Low** — audit `<h4>` heading-order in remaining blog callouts (33 files use `<h4>`; only 1 confirmed/fixed so far); HSTS preload; llms.txt full blog enumeration

---

## Original plan (for reference)

Priorities: **Critical** = blocks indexing / causes penalties · **High** = significant ranking impact (≤1 week) · **Medium** = optimization (≤1 month) · **Low** = backlog.

---

## 🔴 Critical (fix immediately)

> No true index-blockers were found. These are "critical for ranking quality" — thin money pages and brand-entity gaps.

### C1. Expand the 5 thin/templated use-case pages
- **Problem:** `/use-cases/bachelor-party` + 4 siblings carry ~120 words of unique content on an identical scaffold → thin + near-duplicate risk on indexable commercial pages.
- **Fix:** Add destination/scenario-specific content (real cost breakdowns, a worked split example, a short page-specific FAQ with FAQPage schema, an embedded mini-demo). Target ~500+ unique words each.
- **Effort:** M (1–2 days for all 5) · **Files:** `app/use-cases/[slug]/` page/templates.

### C2. Add sitewide Organization + WebSite schema
- **Problem:** No top-level `Organization` (no `logo`, no `sameAs`) and no `WebSite` entity → no brand knowledge-panel or sitelinks-search-box eligibility.
- **Fix:** Inject one JSON-LD block in the global layout: `Organization` (name, url, absolute `logo`, `sameAs` social profiles) + `WebSite` (name, url, publisher, optional `potentialAction`→`SearchAction`).
- **Effort:** S (~1 hr) · **Files:** root layout (`app/layout.tsx` or shared head component).

---

## 🟠 High (fix within 1 week)

### H1. Fix double-encoded HTML entities in meta descriptions  ⭐ quick win
- **Problem:** Descriptions contain `&amp;quot;` / `&amp;apos;` → render as literal `&quot;`/`&apos;` in Google snippets. **Verified live** on `/blog/split-wedding-costs-families`, `/blog/split-rent-by-income-calculator`; also `/blog/splitting-groceries-with-roommates`, `/blog/group-vacation-budget-methods`.
- **Fix:** The source strings are pre-escaped, then re-escaped by the framework. Store plain text (use real `"` and `'`) and let the framework escape once. Audit all post frontmatter/description fields for `&` entities.
- **Effort:** S (~30 min).

### H2. Add `image` + `publisher.logo` to BlogPosting schema  ⭐ quick win
- **Problem:** Blog posts are **ineligible for Article rich results** — `image` and `publisher.logo` (both Google-required) are missing.
- **Fix:** Add `image` (absolute URL ≥1200px — reuse the per-post OG image) and `publisher.logo` (ImageObject) to the BlogPosting generator. Unlocks rich results blog-wide in one change.
- **Effort:** S (~30 min) · **Files:** blog post layout / JSON-LD helper.

### H3. Add www → apex 308 redirect  ⭐ quick win
- **Problem:** `https://www.partytab.app/` serves 200 with no redirect; both hosts live/indexable.
- **Fix:** Add `308 www→apex` at the Vercel domain settings (or `next.config` redirect / middleware).
- **Effort:** XS (~5 min).

### H4. Trim over-length titles (30/42 > 60 chars)
- **Fix:** Drop `| PartyTab` from the longest blog titles and tighten the rest to ≤60 chars. Worst first: `friends-never-pay-you-back` (88), `web-based-expense-tracker-vs-app` (86), `college-roommate-expenses-provo-utah` (80), `remind-someone-owes-you-money` (79).
- **Effort:** M (~1 hr) · **Files:** post frontmatter `title`/metadata.

### H5. Add Product/Offer markup for the Pro plan on `/upgrade`
- **Problem:** Only the global `price:"0"` Offer exists; the $3.99/mo Pro tier is invisible to structured data.
- **Fix:** On `/upgrade`, add `Product` (or `SoftwareApplication` with an `offers` array) listing free ($0) + Pro ($3.99/mo, `priceCurrency`, `availability: InStock`).
- **Effort:** S (~45 min).

### H6. Add named human authors + linked citations to the blog
- **Fix:** Give posts a real person byline with a one-line bio (E-E-A-T). Convert named statistics (LendingTree, Bread Financial) into outbound `<a>` citations — boosts trust and AI citability.
- **Effort:** M (depends on author setup) · **Files:** blog data model + post template.

---

## 🟡 Medium (fix within 1 month)

- **M1. Investigate blog-route TTFB (~1.28s, ~2.5× app pages).** Ensure `/blog/*` is ISR/edge-cached, not dynamically rendered per request. *(Performance — biggest measured LCP risk.)*
- **M2. Trim 6+ over-length meta descriptions** to ≤160 chars (wedding 206, provo 177, avoid-losing-friends 170, utah-ski 169, bachelor-budget 167, splitting-rent 163).
- **M3. Disambiguate cannibalization clusters** — clearest: the three group-dinner pages and the two split-rent posts. Pick one primary target per query, differentiate the others, ensure cross-links.
- **M4. Reduce homepage JS execution (~664 KB uncompressed).** Convert client→server components where possible; code-split the two largest chunks.
- **M5. Add BreadcrumbList** to `/how-it-works`, `/upgrade`, `/compare/splitwise`; add `Blog`/`ItemList` to `/blog` and `/use-cases` index pages.
- **M6. Expand `/compare/splitwise` prose** (~330 → 600+ words) for this high-intent commercial query.
- **M7. Add a human-facing About/Organization page** (pairs with C2's Organization schema).
- **M8. Advance `dateModified`** when posts are updated (freshness signal; currently == `datePublished`).

---

## 🟢 Low (backlog)

- **L1.** Align `/upgrade` H1 ("Upgrade Your Account") with its commercial title → e.g. "Upgrade to PartyTab Pro."
- **L2.** Add `<link rel="alternate" type="application/rss+xml">` for `/blog/feed.xml` in the blog `<head>`.
- **L3.** Add HSTS `preload` (after confirming all subdomains are HTTPS) and consider COOP/COEP hardening.
- **L4.** Add `preconnect` hints for Stripe/Supabase origins if they load on interaction.
- **L5.** Expand `llms.txt` to enumerate all 29 blog posts (currently ~14).
- **L6.** Verify below-the-fold blog images use `next/image` with explicit dimensions (CLS protection).

---

## Implementation Roadmap

| Sprint | Items | Theme |
|--------|-------|-------|
| **Week 1 (quick wins)** | H1, H2, H3, H5, C2 | Schema + SERP-quality bugs — mostly small, high-leverage edits |
| **Week 2–3** | C1, H4, H6, M5 | Content depth + on-page polish |
| **Month 1** | M1, M2, M3, M4, M7, M8 | Performance, cannibalization, E-E-A-T infrastructure |
| **Backlog** | L1–L6 | Hardening + completeness |

**Highest ROI:** the Week-1 schema/bug cluster (H1+H2+H3+H5+C2) — a day of work that fixes a visible SERP bug, unlocks Article rich results across the entire blog, and establishes the brand entity for knowledge-panel + AI citation.

> **Verification gap:** real Core Web Vitals (lab + CrUX field) were not obtained — Google's keyless PSI API was hard-blocked. Provision a free Google PSI/CrUX API key and re-run (`seo-google` skill) to confirm LCP/INP/CLS PASS/FAIL before finalizing the Performance score.
