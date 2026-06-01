# PartyTab — Full SEO Audit Report

**Site:** https://partytab.app
**Audit date:** 2026-05-31
**Business type detected:** SaaS — `FinanceApplication` (free browser-based group bill-splitting), with a content-marketing blog (~29 posts) and local-content angle (Provo/Utah, BYU/UVU). No GBP / brick-and-mortar presence, so Local/Maps specialists were not applicable.
**Pages crawled:** 42 (full sitemap), all returning HTTP 200.
**Method:** Live `curl` fetches + Google PageSpeed Insights attempt + 5 parallel specialist analyses (technical, performance, content/E-E-A-T/GEO, schema, on-page/SXO).

---

## Executive Summary

### Overall SEO Health Score: **86 / 100** — Good (revised up after verification + Week-1/Week-2 remediation)

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Technical SEO | 22% | 90 | 19.8 |
| Content Quality | 23% | 80† | 18.4 |
| On-Page SEO | 20% | 86† | 17.2 |
| Schema / Structured Data | 10% | 90† | 9.0 |
| Performance (CWV) | 10% | 95* | 9.5 |
| AI Search Readiness | 10% | 87† | 8.7 |
| Images | 5% | 85 | 4.3 |
| **Total** | **100%** | | **≈ 86** |

\* Performance **verified** via PSI on 2026-06-01 (lab perf 97–100, CWV pass). CrUX field data unavailable (site below Google's traffic threshold).
† Reflects shipped Week-1 + Week-2 fixes — see Remediation Log below.

### Remediation Log (2026-06-01)

| Commit | Item | Result |
|--------|------|--------|
| `5b17965` | Double-encoded meta entities; Organization + WebSite schema; BlogPosting image/logo; Pro Product/Offer; www→apex 308 | Live; schema verified |
| `34df348` `a9070d3` `cb0447a` | WCAG AA contrast: homepage + all dark-CTA subtitles (`ink-500`/`ink-400` on `ink-900`) across 41+24 pages | PSI Accessibility 96→**100** on home, use-cases, blog |
| `239034a` | heading-order skip in a blog callout (h4→h3) | Fixed (one confirmed instance) |
| `6743e3a` | H4 — 30 over-length titles trimmed to ≤58 chars | Live |
| `830a3f1` | C1 — 5 thin use-case pages expanded with deep-dive prose + 5-Q FAQ each (FAQPage schema via new `FaqSection`) | Live; main content ~120 → 550–850 words; FAQPage + Breadcrumb verified |

**Verified PSI after remediation (mobile):** Home 97/100/100/100 · Use-case 99/100/100/100 · Blog 98/100/100/100 (Perf/A11y/BP/SEO).

PartyTab is a **technically excellent, well-instrumented site** — clean robots.txt, comprehensive `llms.txt`, valid 42-URL sitemap, strong security headers, self-referencing canonicals on every page, one H1 per page, zero missing/duplicate titles or descriptions, and no third-party scripts. It is already ahead of most sites in its class. The remaining gains are concentrated in **content depth (thin templated use-case pages), structured-data coverage (no Organization/WebSite entity, blog posts ineligible for Article rich results), and a handful of fixable on-page bugs**.

### Top 5 Critical / High-Impact Issues

1. **Double-encoded HTML entities in meta descriptions** (4+ blog posts) — descriptions contain `&amp;quot;` / `&amp;apos;`, which render as literal `&quot;` / `&apos;` garbage in Google snippets. *Verified live* on `/blog/split-wedding-costs-families` and `/blog/split-rent-by-income-calculator`. Visible SERP-quality defect.
2. **Thin, templated use-case pages** — `/use-cases/bachelor-party` (and the 4 siblings) carry only ~120 words of differentiated main content on a near-identical scaffold. These are indexable "money" pages at thin/duplicate-content risk.
3. **No Organization or WebSite schema sitewide** — blocks brand knowledge-panel eligibility and sitelinks search box. The only Organization markup is nested as `author`/`publisher` (name + url, no logo, no `sameAs`).
4. **Blog posts ineligible for Article rich results** — `BlogPosting` schema is missing `image` and `publisher.logo` (both Google-required). Otherwise the markup (headline, dates, author, breadcrumb) is complete.
5. **30 of 42 titles exceed ~60 chars** — most blog titles (up to 88 chars) truncate in SERPs, cutting the value tail and the `| PartyTab` brand suffix.

### Top 5 Quick Wins

1. Fix the double-encoded entities at the source string (CMS pre-escapes, framework re-escapes). ~30 min.
2. Add a sitewide `Organization` + `WebSite` (+`SearchAction`) JSON-LD block in the global layout. ~1 hr.
3. Add `image` + `publisher.logo` to `BlogPosting` schema → unlocks Article rich results across the whole blog. ~30 min.
4. Add a single `308` redirect `www.partytab.app → partytab.app` at the Vercel domain level (www currently serves 200 with no redirect). ~5 min.
5. Trim over-length titles, starting by dropping `| PartyTab` from the longest blog posts. ~1 hr.

---

## Technical SEO — Score 90/100

**Strengths**
- **Redirects clean:** `http→https` (308, 1 hop), trailing-slash normalization `/blog/→/blog` (308, 1 hop). No chains.
- **Canonicals:** self-referencing + absolute on every sampled page; sitemap `<loc>` for the homepage matches the canonical.
- **robots.txt:** correctly scopes Disallows to `/tabs/ /demo /feedback /api/ /auth/ /login` etc.; no indexable marketing page blocked. Explicitly allows AI crawlers (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot).
- **Sitemap:** 42 URLs, all 200, plausible lastmod, weekly blog cadence.
- **404 handling:** true 404 on nonexistent paths (no soft-200).
- **Security headers:** CSP, HSTS (`max-age=31536000; includeSubDomains`), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy — consistent across routes.
- **Delivery:** HTTP/2, Brotli compression, `_next/static` assets `immutable` + 1-year cache, `x-vercel-cache: HIT`.

**Issues**
- **[High] `www.partytab.app` returns 200 with no redirect** to the apex. Both hosts are live and indexable; canonical points to apex (self-mitigating) but a `308 www→apex` is the proper fix.
- **[Medium] `/blog/feed.xml`** is valid RSS but not referenced from a `<link rel=alternate>` in the blog `<head>` (it *is* in `llms.txt`). Minor discoverability.
- **[Low] HSTS lacks `preload`; no COOP/COEP.** Hardening nice-to-haves, not SEO blockers.
- **[Low] Cosmetic:** canonical/sitemap use apex with no trailing slash (`https://partytab.app`) while the http redirect lands on `/`. Google treats these as equivalent; no action needed.

---

## Content Quality — Score 72/100

**Strengths**
- Blog posts are genuinely strong and differentiated: `/blog/best-splitwise-alternatives` (~1,400 words, 7 named competitors + comparison table), `/blog/money-ruining-friendships-statistics` (~1,150 words, real cited stats), `/blog/college-roommate-expenses-provo-utah` (localized specifics — WinCo, cleaning checks, BYU/UVU contracts).
- Good structure throughout: single H1, logical H2/H3, lists, real HTML tables, answer-first "In This Guide" / "Quick Summary" blocks.
- Healthy internal linking — posts and use-cases cross-link to `/compare/splitwise`, related posts, and sibling use-cases. No orphans detected.

**Issues**
- **[Critical] Thin/templated use-case pages.** `/use-cases/bachelor-party` ≈ 120 words of unique main content; the same "How PartyTab Works for X / Typical X Expenses / Why PartyTab for X" scaffold repeats across all 5 use-case pages → thin + near-duplicate risk on indexable commercial pages.
- **[High] No human author/byline.** Every post's author is `{Organization: PartyTab}` — no person, no credentials. Weakest E-E-A-T signal for advice/statistics content ("Experience"/"Expertise").
- **[High] Cited statistics are not linked.** The statistics post names sources (LendingTree 2025, Bread Financial 2024) as plain text with zero outbound links → not verifiable, reduces trust and citability.
- **[Medium] `/compare/splitwise` prose is thin (~330 words)** for a high-intent commercial query (a comparison table + FAQ schema partly compensate).
- **[Medium] No human-facing About/Organization page** surfaced in content nav.
- **[Low] No "last updated" trust signal** on use-case/compare pages.

Approx. content depth (main content):

| Page | ~Words | Verdict |
|------|--------|---------|
| /blog/best-splitwise-alternatives | 1,400 | Strong |
| /blog/money-ruining-friendships-statistics | 1,150 | Strong |
| /blog/college-roommate-expenses-provo-utah | 800 | Good |
| /blog/splitting-rent-fairly | 500 | Adequate |
| /compare/splitwise | 330 | Thin-ish |
| /use-cases/bachelor-party | 120 | **Thin** |

---

## On-Page SEO — Score 74/100

**Baseline (excellent):** 0 missing titles, 0 missing descriptions, 0 duplicate titles, 0 duplicate descriptions, exactly one H1 on all 42 pages, every canonical self-referencing.

**Issues**
- **[High] Double-encoded entities in meta descriptions** — `/blog/split-wedding-costs-families` (`&amp;quot;bride&amp;apos;s family&amp;quot;`, also inflated to 206 chars), `/blog/split-rent-by-income-calculator` (`isn&amp;apos;t`), `/blog/splitting-groceries-with-roommates`, `/blog/group-vacation-budget-methods`. Templating bug — fix the source string, not the template. **Verified live.**
- **[High] 30/42 titles exceed ~60 chars** (worst: `/blog/friends-never-pay-you-back` 88, `/blog/web-based-expense-tracker-vs-app` 86, `/blog/college-roommate-expenses-provo-utah` 80). Truncates in SERP.
- **[Medium] 6+ descriptions exceed 160 chars** (wedding 206, provo 177, avoid-losing-friends 170, utah-ski 169, bachelor-budget 167, splitting-rent 163).
- **[Medium] Keyword-cannibalization clusters** to monitor:
  - Group dinners: `/use-cases/group-dinners` + `/blog/splitting-group-dinner-bills` + `/blog/large-group-dinner-bill-tips` (highest overlap).
  - Split rent: `/blog/splitting-rent-fairly` vs `/blog/split-rent-by-income-calculator`.
  - Splitwise: `/compare/splitwise` (vs) vs `/blog/best-splitwise-alternatives` (alternatives) — distinct intent, keep cross-linked.
  - Ski / roommates clusters partly mitigated by Utah geo-differentiation.
- **[Low] `/upgrade` H1/title intent gap** — keyword-rich title ("Upgrade to PartyTab Pro | Receipt Scanning & Payment Reminders") but generic H1 "Upgrade Your Account." Align the H1 to the Pro keywords.
- **[Low] `/privacy` (25), `/terms` (27)** titles <30 chars — intentional for legal pages, no action.

---

## Schema / Structured Data — Score 68/100

All JSON-LD parses as valid. Coverage by page type:

| Page | @types |
|------|--------|
| / | SoftwareApplication, FAQPage |
| /how-it-works | SoftwareApplication, HowTo, FAQPage |
| /upgrade | SoftwareApplication |
| /compare/splitwise | SoftwareApplication, FAQPage |
| /blog | SoftwareApplication |
| /blog/best-splitwise-alternatives | SoftwareApplication, BlogPosting, BreadcrumbList |
| /use-cases/bachelor-party | SoftwareApplication, BreadcrumbList |
| /use-cases | SoftwareApplication |

**Issues**
- **[Critical] No sitewide Organization schema** — no `logo`, no `sameAs`. Blocks brand knowledge-panel eligibility.
- **[Critical] No WebSite schema + no SearchAction** — no sitelinks-search-box eligibility, no canonical website entity.
- **[High] BlogPosting missing `image`** (and `publisher.logo`) → blog posts **ineligible for Article rich results** despite otherwise-complete markup. Highest-value blog fix.
- **[High] `/upgrade` has no Product/Offer for the paid tier** — the only Offer sitewide is the global SoftwareApplication's `price: "0"`. The $3.99/mo Pro plan is invisible to structured data.
- **[High] Offer missing `availability`** (e.g. `InStock`); **no `aggregateRating`** (leave out if no real ratings — do not fabricate).
- **[Medium] `datePublished` === `dateModified`** on sampled post — advance `dateModified` on updates for a freshness signal.
- **[Medium] No BreadcrumbList** on `/how-it-works`, `/upgrade`, `/compare/splitwise`, `/blog`, `/use-cases`; no `Blog`/`ItemList` on index pages.
- **[Low] HowTo** present on `/how-it-works` but Google deprecated HowTo rich results (Aug 2023) — no visible SERP benefit. FAQ markup valid but display now gated to authoritative sites.

---

## Performance (CWV) — Score 95/100 (VERIFIED via PageSpeed Insights, 2026-06-01)

> **Update:** Provisioned a Google PSI/CrUX API key and ran real Lighthouse audits. Lab performance is near-perfect. **CrUX field data is unavailable** — the Chrome UX Report API returns `404 NOT_FOUND` at both URL and origin level, meaning partytab.app does not yet meet Google's real-user traffic threshold. Field data will populate as traffic grows; lab data below is the source of truth for now.

**Lighthouse lab scores (PSI v5):**

| Page (strategy) | Perf | A11y | Best-Prac | SEO | LCP | CLS | TBT | FCP | SI |
|---|---|---|---|---|---|---|---|---|---|
| Home (mobile) | 98 | 96 | 100 | 100 | 2.4s | 0 | 40ms | 0.9s | 2.3s |
| Home (desktop) | 100 | 96 | 100 | 100 | 0.5s | 0 | 10ms | 0.2s | 0.3s |
| Upgrade (mobile) | 99 | 96 | 100 | 100 | 2.0s | 0 | 10ms | 0.9s | 2.7s |
| Blog: alternatives (mobile) | 99 | 96 | 100 | 100 | 2.3s | 0 | 50ms | 1.0s | 1.8s |

**Verdict:** All pages **pass Core Web Vitals lab thresholds** — LCP ≤ 2.4s (< 2.5s), CLS = 0 (perfect), TBT 10–50ms (excellent INP proxy). The earlier curl-proxy concerns are **disproven**: the "~664 KB uncompressed JS" does not hurt real CWV (TBT 10–50ms), and the blog route renders fine (Perf 99, FCP 1.0s) — the elevated raw-curl TTFB did not translate into a Lighthouse penalty.

**Strengths**
- HTML Brotli-compressed; all static assets Brotli + `immutable` 1-year cache. Zero third-party scripts. Self-hosted woff2 fonts. No `<img>` in initial HTML (text/CSS LCP element).

**Remaining opportunities (minor)**
- **[Low] ~150ms unused JavaScript** on home + upgrade (only opportunity Lighthouse flags with measurable savings). Code-split if convenient; not impactful at current scores.
- **[Low] No `preconnect`/`dns-prefetch`** — negligible (no third parties).

**New finding — Accessibility (96, not 100): single WCAG AA color-contrast failure.**
- The homepage dark CTA section (`bg-ink-900`) had a `text-ink-500` (#6f6a61) paragraph at **3.23:1** (needs 4.5:1). This is a regression from the documented v1.0.0 a11y-100 baseline. **Fixed 2026-06-01** → `text-ink-300` (#a8a29a, ~6.9:1). Re-run PSI after deploy to confirm A11y returns to 100.

---

## AI Search Readiness (GEO) — Score 85/100

**Strengths**
- **`llms.txt` is comprehensive and well-formed** — H1 + summary blockquote, sectioned (Key Pages, Use Cases, Blog, Quick Facts, Legal, RSS), every link annotated. The "Quick Facts" block (price, web-only, greedy settlement, Pro features) is exactly the extractable fact set LLMs cite.
- AI crawlers explicitly allowed in robots.txt.
- FAQPage schema (home, how-it-works, compare) + extractable answer-first passages (stat headlines, "Quick Summary" decision blocks).

**Issues**
- **[High] Cited stats lack source links** — adding linked references would make PartyTab the citable consolidating source (vs. LLMs going straight to LendingTree).
- **[Medium] No Organization entity** to anchor brand mentions (ties into the schema gap).
- **[Low] `llms.txt` enumerates ~14 of 29 blog posts** — acceptable, but not exhaustive.

---

## Images — Score 85/100

**Strengths**
- No raw `<img>` in initial HTML (Next.js Image / inline SVG) — protects CLS, alt handling.
- OG image present and correctly sized (1200×630, with `og:image:alt`) sitewide; Twitter `summary_large_image`.

**Issues**
- **[High — counted under Schema] BlogPosting `image` missing** — also the key image-schema gap.
- **[Low] Verify** below-the-fold blog/hero images use `next/image` with explicit dimensions (unmeasurable via HTML-only fetch).

---

## Appendix — What's Already Excellent (don't touch)

robots.txt scoping · AI-crawler allowlist · llms.txt · self-referencing canonicals on all 42 pages · one H1 per page · zero missing/duplicate titles & descriptions · Brotli + immutable caching · zero third-party JS · full security-header set · valid sitemap · true 404s · healthy internal linking / no orphans.
