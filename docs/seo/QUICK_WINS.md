# SEO Quick Wins - Do These First

**Estimated Time:** 2-4 hours total  
**Impact:** High - Gets us indexed and discoverable

---

## 1. Update Homepage Metadata (30 min)

### Current (Bad)
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: "PartyTab",
  description: "Track shared expenses, settle later.",
};
```

### Updated (Good)
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: "PartyTab | Free Bill Splitting App - No Download Required",
  description: "Split group expenses for trips, dinners, and roommates. Track who paid what and settle up easily. Works in your browser—no app download needed. Free to use.",
  keywords: ["bill splitting app", "split expenses", "group expense tracker", "no app download", "free bill splitter"],
  openGraph: {
    title: "PartyTab - Split Group Expenses the Easy Way",
    description: "Track and share expenses with friends on trips, parties, and shared living. No app download required.",
    url: "https://partytab.app",
    siteName: "PartyTab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PartyTab | Free Bill Splitting App",
    description: "Split group expenses—no app download needed.",
  },
};
```

---

## 2. Create Sitemap (15 min)

### Create `app/sitemap.ts`
```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://partytab.app';
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Add more pages as you create them:
    // {
    //   url: `${baseUrl}/how-it-works`,
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly',
    //   priority: 0.8,
    // },
  ];
}
```

---

## 3. Create Robots.txt (5 min)

### Create `public/robots.txt`
```
# PartyTab robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: https://partytab.app/sitemap.xml

# Block auth pages from indexing
Disallow: /login
Disallow: /register
Disallow: /signin
Disallow: /claim/
Disallow: /join/
Disallow: /api/
```

---

## 4. Add JSON-LD Schema (20 min)

### Option A: Add to `app/layout.tsx`
Add this script tag in the `<head>`:

```typescript
// In RootLayout, inside the <html> tag, add:
<head>
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "PartyTab",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Split group expenses for trips, dinners, and roommates. No app download required.",
        "url": "https://partytab.app",
        "featureList": [
          "No app download required",
          "Instant tab creation",
          "Smart settlement calculations",
          "Share via link"
        ]
      })
    }}
  />
</head>
```

### Option B: Create a separate component
```typescript
// app/components/JsonLd.tsx
export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PartyTab",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: "Split group expenses for trips, dinners, and roommates. No app download required.",
    url: "https://partytab.app",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

---

## 5. Set Up Google Search Console (30 min)

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://partytab.app`
3. Verify via DNS TXT record or HTML file
4. Submit sitemap: `https://partytab.app/sitemap.xml`
5. Request indexing of homepage

---

## 6. Update Page Titles (15 min)

### Pages to Update:

**app/tabs/new/page.tsx**
```typescript
export const metadata = {
  title: "Start a New Tab | PartyTab",
  description: "Create a new expense-sharing tab for your trip, party, or shared living.",
};
```

**app/upgrade/page.tsx**
```typescript
export const metadata = {
  title: "Upgrade to Pro | PartyTab",
  description: "Get receipt scanning, reminders, and more with PartyTab Pro.",
};
```

**app/login/page.tsx**
```typescript
export const metadata = {
  title: "Login | PartyTab",
  description: "Sign in to PartyTab to access your expense tabs.",
  robots: "noindex", // Don't index login page
};
```

---

## Checklist

- [x] Update `app/layout.tsx` with new metadata
- [x] Create `app/sitemap.ts`
- [x] Create `public/robots.txt`
- [x] Add JSON-LD schema to homepage
- [ ] Set up Google Search Console
- [ ] Submit sitemap
- [x] Update metadata on key pages
- [ ] Verify changes deployed

---

## After Completing Quick Wins

1. **Wait 1-2 weeks** for Google to index
2. **Check Search Console** for any crawl errors
3. **Start Phase 2** - Create use-case landing pages
4. **Submit to directories** - Product Hunt, AlternativeTo

---

## Verification

After deploying, check:
- [ ] `partytab.app/sitemap.xml` returns valid sitemap
- [ ] `partytab.app/robots.txt` returns valid file
- [ ] View page source shows updated `<title>` and `<meta>`
- [ ] Google Rich Results Test shows schema: https://search.google.com/test/rich-results

---

*Do these quick wins ASAP—they're the foundation for everything else.*
