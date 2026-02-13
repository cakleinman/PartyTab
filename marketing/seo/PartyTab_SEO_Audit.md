# SEO Audit: PartyTab.app

**Audit Date:** February 12, 2026  
**Auditor:** Claude (Anthropic)  
**Site:** https://partytab.app  
**Category:** Bill-splitting / Group expense web app

---

## Executive Summary

PartyTab.app is a lightweight, browser-based group expense splitting tool with a clean UX and solid value proposition ("no app download required"). However, the site has **critical SEO deficiencies** that are keeping it almost entirely invisible to search engines. The domain does not appear in Google search results at all — not even for its own brand name. This means the site is effectively getting **zero organic traffic**.

**Overall SEO Score: 2/10** — The product is good, but the SEO foundation hasn't been built yet.

---

## 1. Indexation & Visibility (CRITICAL)

### Findings

- **Not indexed by Google.** A `site:partytab.app` search returns zero results. Searching for "partytab.app" returns unrelated results (a WoW addon, a TikTok account, a Square site, etc.) — the actual bill-splitting app does not appear.
- **No sitemap.xml detected.** Attempting to access `partytab.app/sitemap.xml` failed.
- **No robots.txt detected.** Attempting to access `partytab.app/robots.txt` failed.
- **Unknown Google Search Console status.** It's likely the site hasn't been submitted to Google Search Console at all.

### Impact

Without indexation, the site receives literally zero organic search traffic. This is the single most important issue.

### Recommendations

1. **Submit to Google Search Console immediately.** Verify domain ownership and request indexing.
2. **Create a sitemap.xml** listing all crawlable pages (`/`, `/tabs`, `/tabs/new`, any blog/help pages).
3. **Create a robots.txt** allowing search engine crawling of all public pages.
4. **Submit sitemap to Bing Webmaster Tools** as well.

---

## 2. On-Page SEO

### Title Tag

- **Current:** `PartyTab - Split Group Expenses the Easy Way`
- **Assessment:** Decent but could be stronger. Title is 48 characters — room for more keywords.
- **Recommended:** `PartyTab — Free Bill Splitting App | No Download Required`
  - Adds "free" (high-intent keyword), "bill splitting app" (primary search term), and the key differentiator.

### Meta Description

- **Current:** Not clearly defined (the fetched page shows a text rendering but no explicit meta description was detected in the HTML source).
- **Assessment:** Likely missing or auto-generated.
- **Recommended:** Add a compelling 150-160 character meta description:
  > "Split group expenses for free — no app download needed. PartyTab tracks who paid what and calculates the simplest way to settle up. Perfect for trips, dinners & roommates."

### Heading Structure

| Element | Content | Assessment |
|---------|---------|------------|
| H1 | "Enjoy the trip. We'll handle the tab." | ❌ Clever copy, but zero keywords. Google can't tell what this page is about. |
| H2 | "Ski Weekend 🎿" | ❌ Demo section header, not SEO-useful |
| H2 | "No more passing the same $20 bill around." | ⚠️ Engaging, but not keyword-rich |
| H2 | "Ready to stop chasing payments?" | ⚠️ Good CTA, no keywords |

**Problem:** The entire page has no headings containing core keywords like "bill splitting," "split expenses," "group expense tracker," or "settle up." Google has very little semantic signal about what this app does.

### Recommendations

1. **Rewrite H1** to include primary keyword while keeping personality: `"Split Group Expenses the Easy Way — No App Required"`
2. **Add keyword-rich H2s** like "How Bill Splitting Works with PartyTab" or "The Simplest Way to Split Expenses with Friends."
3. **Add an FAQ section** with questions people actually search (see Content Strategy below).

---

## 3. Content & Keyword Strategy

### Current State

The homepage is a single landing page with approximately 150 words of body text. There are no secondary pages, no blog, no help docs, and no keyword-targeted content.

### Keyword Gap Analysis

These are high-volume search terms that PartyTab is positioned to rank for but currently captures **none** of:

| Keyword | Est. Monthly Search Volume | Difficulty |
|---------|---------------------------|------------|
| bill splitting app | 5,000–10,000 | Medium-High |
| split expenses with friends | 2,000–5,000 | Medium |
| group expense tracker | 1,000–3,000 | Medium |
| split bill calculator | 3,000–8,000 | Medium |
| no download bill splitter | Low but high-intent | Low |
| trip expense splitter | 1,000–2,000 | Low-Medium |
| settle up app | 500–1,000 | Low |
| roommate expense tracker | 1,000–3,000 | Medium |

### Content Recommendations

1. **Create targeted landing pages** for each use case:
   - `/ski-trip-expense-splitter` — "Split Ski Trip Expenses"
   - `/roommate-bill-splitter` — "Split Bills with Roommates"
   - `/dinner-bill-splitter` — "Split Restaurant Bills"
   - `/vacation-expense-tracker` — "Track Group Vacation Expenses"

2. **Start a blog** targeting long-tail keywords:
   - "How to split expenses on a group trip without awkwardness"
   - "Best free bill splitting apps 2026 (no download required)"
   - "How to fairly split unequal expenses"
   - "Splitwise alternatives that don't require an app download"

3. **Add an FAQ section** to the homepage (also feeds Google's "People Also Ask" feature):
   - "Is PartyTab free?"
   - "Do my friends need to download an app?"
   - "How does PartyTab simplify payments?"
   - "Can I use PartyTab for roommate expenses?"

---

## 4. Technical SEO

### Page Speed & Performance

- The site appears to be a lightweight web app (likely Next.js or similar SPA framework), which is good for speed.
- **Concern:** Single Page Applications (SPAs) can be problematic for SEO if not server-side rendered (SSR). If the app is fully client-rendered, Googlebot may see a blank page.

### Recommendations

1. **Verify SSR/SSG is enabled.** Check whether the homepage HTML contains the actual content when JavaScript is disabled. If not, switch to server-side rendering or static site generation.
2. **Add structured data (JSON-LD):**
   - `SoftwareApplication` schema (name, category, operating system: "Web", offers: free)
   - `FAQPage` schema for any FAQ content
   - `WebApplication` schema with application category
3. **Implement Open Graph and Twitter Card meta tags** for better social sharing:
   ```html
   <meta property="og:title" content="PartyTab — Free Bill Splitting App">
   <meta property="og:description" content="Split group expenses for free...">
   <meta property="og:image" content="https://partytab.app/og-image.png">
   <meta property="og:url" content="https://partytab.app">
   <meta name="twitter:card" content="summary_large_image">
   ```
4. **Add canonical URLs** to every page to prevent duplicate content issues.
5. **Ensure proper HTTP status codes** — all pages should return 200, and dead links should 404 properly.

---

## 5. Backlink Profile & Domain Authority

### Current State

- **Estimated Domain Authority:** Near zero. The domain is brand new and has no detectable backlinks.
- **Referring domains:** Likely 0 or near-0.
- **Brand mentions:** The brand name "PartyTab" competes with a WoW addon, a TikTok account for a party planning service, and general noise. This makes branded search unreliable.

### Recommendations

1. **List on app directories and comparison sites:**
   - Product Hunt launch
   - AlternativeTo.net (list as alternative to Splitwise, Splid, Kittysplit)
   - G2, Capterra, Software Advice (even for free tools)
   - AppSumo marketplace
   
2. **Get featured in "best bill splitting apps" roundup articles.** The competitive landscape includes Splitwise, Splid, Kittysplit, Lily Split, Bill Split Pro, and Tricount. These roundup articles drive significant referral and SEO value. Pitch the "no download required" angle.

3. **Write guest posts** on personal finance, travel, and college-life blogs targeting "how to split expenses" topics, linking back to PartyTab.

4. **Create a press/media page** with a press kit, making it easy for journalists and bloggers to link to you.

5. **Submit to startup directories:** BetaList, SaaSHub, Launching Next, etc.

---

## 6. Competitive Analysis

### Key Competitors (by search visibility)

| Competitor | Key Advantage | Weakness vs PartyTab |
|------------|--------------|---------------------|
| **Splitwise** | Massive brand, 10M+ users, top rankings | Requires app download, limits free tier to 4 expenses/day, ads |
| **Splid** | Clean UI, no registration | Requires app download |
| **Kittysplit** | No registration, browser-based | Limited features |
| **Bill Split Pro** | Browser-based, syncs across devices | Less polished |
| **Lily Split** | OCR scanning, no login | Less known |

### PartyTab's Differentiator

The "no app download required" angle is PartyTab's killer feature. Splitwise users are increasingly frustrated with the 4-expenses-per-day free tier limit and forced app downloads. **This is a massive content marketing opportunity** — target searches like "splitwise alternative no download" and "free bill splitting without app."

---

## 7. Local/Social SEO

### Social Presence

- A TikTok account `@partytab` exists but appears to be a different business (party getaway planning service, not bill splitting).
- No LinkedIn, Twitter/X, or other social profiles detected for the bill-splitting PartyTab.

### Recommendations

1. **Claim social handles** on Twitter/X, LinkedIn, Instagram, and TikTok under a consistent brand (e.g., `@partytabapp` if `@partytab` is taken).
2. **Create a LinkedIn company page** — even simple presence helps with branded search and authority signals.
3. **Note the brand confusion risk** — the "PartyTab" name collides with an existing party planning service. Consider whether this is a long-term brand concern.

---

## 8. Priority Action Plan

### Immediate (This Week)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 1 | Register with Google Search Console & request indexing | 🔴 Critical | Low |
| 2 | Create sitemap.xml and robots.txt | 🔴 Critical | Low |
| 3 | Add meta description to homepage | 🔴 High | Low |
| 4 | Add Open Graph / Twitter Card meta tags | 🟡 Medium | Low |
| 5 | Verify server-side rendering is working | 🔴 Critical | Medium |

### Short-Term (Next 30 Days)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 6 | Rewrite H1 and headings with keywords | 🔴 High | Low |
| 7 | Add structured data (JSON-LD) | 🟡 Medium | Low |
| 8 | Add FAQ section to homepage | 🟡 Medium | Low |
| 9 | Create 3-4 use-case landing pages | 🔴 High | Medium |
| 10 | Submit to Product Hunt | 🟡 Medium | Medium |

### Medium-Term (Next 90 Days)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 11 | Launch a blog with 5-10 keyword-targeted posts | 🔴 High | High |
| 12 | Pitch to "best bill splitting app" roundup articles | 🔴 High | Medium |
| 13 | List on AlternativeTo, app directories | 🟡 Medium | Low |
| 14 | Build 10-20 quality backlinks through outreach | 🔴 High | High |
| 15 | Claim and build social media presence | 🟡 Medium | Medium |

---

## Summary

PartyTab has a genuinely good product with a clear competitive advantage (browser-based, no download, free). But from an SEO perspective, it's essentially invisible. The site isn't indexed, has no keyword strategy, no backlinks, and minimal on-page optimization. The good news is that the bill-splitting niche has room for challengers — especially as Splitwise frustrates users with its free tier limitations. With focused execution on the action plan above, PartyTab could realistically start ranking for long-tail keywords within 60-90 days and build meaningful organic traffic within 6 months.
