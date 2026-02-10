# PartyTab SEO Audit Report

**Date:** January 24, 2026  
**Status:** Research Complete - Recommendations Pending Implementation

---

## Executive Summary

PartyTab has **virtually zero SEO presence**. A search for "PartyTab bill splitting" returns no results for our app—we are not indexed or discoverable. Meanwhile, competitors like Splitwise dominate the market with:
- **2.93 million monthly visits**
- **260,000+ backlinks**
- Extensive content strategy (blog, comparison pages, use-case guides)

The bill splitting app market is **$423M+ and growing at 11% CAGR**. There is significant opportunity, but we must build from scratch.

> **Bottom line:** We have a great product but nobody can find it. This audit identifies exactly what we need to fix.

---

## Market Analysis

### Market Size & Growth
- **Current market:** $423.6 million (2023)
- **CAGR:** 11.32% through 2028
- **Projected:** $7.9B - $12B by 2032-2034
- **Android dominance:** $239.5M segment (2022)
- **Total app downloads:** 50M+ on Google Play alone

### Key Growth Drivers
1. Digital payment adoption acceleration
2. Social activities (group dinners, travel, shared living)
3. High smartphone penetration
4. Millennials/Gen Z preference for convenience
5. Asia-Pacific and North America leading growth

---

## Competitor Analysis

### Splitwise (Market Leader)

| Metric | Value |
|--------|-------|
| Monthly visits | 2.93 million |
| Average session | 4:43 minutes |
| Pages per visit | 3.69 |
| Bounce rate | 28.2% |
| Backlinks | 260,920 |
| Referring domains | 6,260 |

**SEO Strengths:**
- Title: "Split expenses with friends. :: Splitwise"
- Dynamic H1 cycling through use cases ("housemates", "trips", "partners")
- Extensive navigation: Blog, Press, Calculators, API, Jobs, Pro
- Strong content strategy with blog posts about development updates
- Listed on Product Hunt, AlternativeTo, G2, Capterra

**Weaknesses to Target:**
- Requires app download for full functionality
- Free version has ads and daily expense limits
- Requires account creation

### Tricount

**SEO Strengths:**
- Title: "Simplify Group Expenses | tricount by bunq"
- H1: "The easiest way to split the bill"
- Strong social proof: "Trusted by 17 million people"
- **Aggressive competitor targeting:**
  - Dedicated "Compare tricount" section
  - "Splitwise Importer" feature
  - Splitwise vs Tricount comparison pages
- Use-case specific landing pages (Couples, Holidays, Roommates, Freelancers)

**What We Can Learn:**
- Create comparison pages targeting competitor users
- Build use-case specific landing pages
- Lead with social proof when we have it

### PartyTab (Current State)

| Element | Current | Problem |
|---------|---------|---------|
| Title | `PartyTab` | No keywords, no value proposition |
| Meta Description | "Track shared expenses, settle later." | Too short, no keywords |
| H1 | "Enjoy the trip. We'll handle the tab." | Creative but not searchable |
| Sitemap | ❌ None | Google can't crawl efficiently |
| Robots.txt | ❌ None | No crawl directives |
| Schema/JSON-LD | ❌ None | Missing rich snippets opportunity |
| Blog | ❌ None | No content marketing |
| Use-case pages | ❌ None | Missing landing page opportunities |
| Comparison pages | ❌ None | Missing competitor traffic capture |

---

## Internal Technical Audit

### Codebase Review

**Current Metadata (`app/layout.tsx`):**
```typescript
export const metadata: Metadata = {
  title: "PartyTab",
  description: "Track shared expenses, settle later.",
  // No keywords, no Open Graph, minimal metadata
};
```

**What's Missing:**
1. **No sitemap.xml** - Google can't efficiently discover pages
2. **No robots.txt** - No crawl optimization
3. **No JSON-LD schema** - Missing SoftwareApplication structured data
4. **No Open Graph tags** - Poor social sharing previews
5. **Minimal page metadata** - Only privacy/terms have custom meta

**What's Good:**
- Next.js with proper head management
- Vercel Analytics + SpeedInsights installed (performance monitoring)
- Dynamic metadata on claim/join pages (shows the pattern works)
- HTTPS (confirmed via browser)
- Mobile responsive ✓

### Page Structure

| Page | Custom Metadata | SEO Optimized |
|------|----------------|---------------|
| Home (/) | ❌ Uses default | ❌ |
| /privacy | ✓ Custom title | Partial |
| /terms | ✓ Custom title | Partial |
| /claim/[token] | ✓ Dynamic | ✓ Good pattern |
| /join/[token] | ✓ Dynamic | ✓ Good pattern |
| /tabs/* | ❌ Default | ❌ |
| /login, /register | ❌ Default | ❌ |

---

## Keyword Opportunity Analysis

### Primary Keywords (High Intent)

| Keyword | Est. Monthly Searches | Difficulty | PartyTab Fit |
|---------|----------------------|------------|--------------|
| bill splitting app | 1,000-2,500 | Medium | ⭐⭐⭐⭐⭐ |
| split expenses app | 1,000-2,500 | Medium | ⭐⭐⭐⭐⭐ |
| group expense tracker | 500-1,000 | Medium | ⭐⭐⭐⭐⭐ |
| split bills with friends app | 500-1,000 | Low | ⭐⭐⭐⭐⭐ |

### Long-Tail Keywords (Low Competition, High Intent)

| Keyword | Why It Matters |
|---------|----------------|
| bill splitting app no download | **Our main differentiator** |
| split bills without app | **Our main differentiator** |
| web based expense splitter | Direct fit |
| bachelor party expense splitter | Use-case specific |
| ski trip cost calculator | Use-case specific |
| roommate bill splitting free | High intent |
| splitwise alternative no account | Competitor targeting |
| tricount vs splitwise | Insert ourselves in comparison |

### Competitor Keywords to Target

| Keyword | Opportunity |
|---------|-------------|
| splitwise alternative | Position as simpler, no-app option |
| apps like splitwise but simpler | Direct comparison opportunity |
| splitwise free limits | Target frustrated users |
| best expense splitting app 2026 | Listicle opportunity |

---

## PartyTab's Unique Differentiators for SEO

1. **"No App Download Required"** - This is GOLD
   - Search: "bill splitting website" / "split bills online" / "no app expense splitter"
   - Competitors require native apps for full functionality
   
2. **Instant Tab Creation** - No account needed to start
   - Search: "split bills without login" / "quick expense splitter"
   
3. **Link-Based Sharing** - Share via URL
   - Search: "share expense tab with friends"

---

## Recommendations Priority Matrix

### 🔴 Critical (Week 1)

1. **Update homepage metadata**
   - Title: "PartyTab | Free Bill Splitting & Group Expense Tracker - No App Required"
   - Description: "Split group expenses for trips, dinners, and shared living. Track who paid what, get the simplest way to settle up. Works in your browser - no app download needed."

2. **Create sitemap.xml**
   - Next.js can generate this automatically
   - Submit to Google Search Console

3. **Create robots.txt**
   - Allow all crawlers
   - Point to sitemap

4. **Add JSON-LD Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PartyTab",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### 🟡 Important (Month 1)

5. **Create /how-it-works page**
   - Detailed product explanation
   - Internal linking anchor

6. **Create use-case landing pages:**
   - `/use-cases/bachelor-party`
   - `/use-cases/ski-trips`
   - `/use-cases/roommates`
   - `/use-cases/group-dinners`

7. **Add Open Graph tags for social sharing**
   - og:title, og:description, og:image
   - Twitter card tags

8. **Submit to directories:**
   - Product Hunt
   - AlternativeTo (as Splitwise alternative)
   - BetaList
   - IndieHackers

### 🟢 Growth (Month 2+)

9. **Start blog**
   - "How to Split an Airbnb Fairly"
   - "Bachelor Party Budget Calculator"
   - "PartyTab vs Splitwise: Which is Right for You?"

10. **Create comparison page**
    - `/compare/splitwise`
    - Highlight: no app, no account, instant sharing

11. **Build backlinks**
    - Guest posts on travel blogs
    - Personal finance site outreach
    - Travel resource page link building

---

## Technical Implementation Checklist

- [ ] Update `app/layout.tsx` with keyword-rich metadata
- [ ] Create `app/sitemap.ts` (Next.js sitemap generator)
- [ ] Create `public/robots.txt`
- [ ] Add JSON-LD schema to homepage
- [ ] Add Open Graph meta tags
- [ ] Create `/how-it-works/page.tsx`
- [ ] Create `/use-cases/` directory with landing pages
- [ ] Create `/blog/` infrastructure
- [ ] Create `/compare/splitwise/page.tsx`
- [ ] Set up Google Search Console
- [ ] Submit sitemap to Google

---

## Measurement & KPIs

### Baseline (Now)
- Google Search visibility: **0** (not indexed)
- Organic traffic: **Unknown** (likely 0)
- Backlinks: **Unknown** (likely <10)

### 30-Day Goals
- [ ] Homepage indexed by Google
- [ ] 5+ pages indexed
- [ ] Google Search Console showing impressions
- [ ] 3+ directory listings live

### 90-Day Goals
- [ ] Ranking for "partytab" brand queries
- [ ] First impressions for "bill splitting app no download"
- [ ] 10+ referring domains
- [ ] Blog section with 5+ posts

### 6-Month Goals
- [ ] 1,000+ monthly organic visits
- [ ] Ranking page 1-2 for 3+ target keywords
- [ ] 50+ backlinks
- [ ] Blog driving 20%+ of traffic

---

## Files in this SEO Folder

| File | Purpose |
|------|---------|
| `SEO_AUDIT.md` | This comprehensive audit report |
| `../marketing/seo/SEO_STRATEGY.md` | Previous keyword and content strategy |
| `KEYWORD_RESEARCH.md` | (To create) Detailed keyword database |
| `COMPETITOR_TRACKING.md` | (To create) Ongoing competitor monitoring |

---

## Next Steps

1. **Review this audit** and approve priorities
2. **Implement Critical items** (metadata, sitemap, robots.txt)
3. **Set up Google Search Console** for monitoring
4. **Plan content calendar** for use-case pages and blog
5. **Begin outreach** for directory listings

---

*This audit was generated on January 24, 2026. The SEO landscape changes rapidly - revisit quarterly.*
