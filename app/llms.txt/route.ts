import { getPublishedPosts } from "@/app/blog/posts";

const BASE = "https://partytab.app";

/**
 * llms.txt — served dynamically so the Blog list always reflects every
 * published post (the previous static file drifted to ~half the posts).
 * Curated sections are templated here; the Blog section is generated from
 * getPublishedPosts() so it never falls out of sync.
 */
export async function GET() {
  const posts = getPublishedPosts();

  const blogLines = [
    `- [Blog Index](${BASE}/blog): Tips, guides, and advice about splitting expenses with friends`,
    ...posts.map(
      (post) => `- [${post.title}](${BASE}/blog/${post.slug}): ${post.excerpt}`
    ),
  ].join("\n");

  const body = `# PartyTab

> PartyTab is a free, browser-based bill splitting app. Groups create a tab, log expenses as they go, and settle up with minimal payments — no app download required.

## Key Pages

- [Home](${BASE}): Landing page with interactive demo and FAQ
- [How It Works](${BASE}/how-it-works): 5-step guide to splitting expenses with PartyTab
- [Upgrade to Pro](${BASE}/upgrade): Plan comparison — Free vs Pro features and pricing
- [PartyTab vs Splitwise](${BASE}/compare/splitwise): Feature-by-feature comparison with decision guide

## Use Cases

- [Bachelor Party Expenses](${BASE}/use-cases/bachelor-party): Split bar tabs, Airbnb, activities — typical costs $300-900/person
- [Ski Trip Costs](${BASE}/use-cases/ski-trips): Split cabin rentals, lift tickets, gear, and après-ski
- [Roommate Bills](${BASE}/use-cases/roommates): Split rent, utilities, groceries, and household expenses
- [Group Dinner Bills](${BASE}/use-cases/group-dinners): Fair splitting when everyone orders differently
- [College Roommates](${BASE}/use-cases/college-roommates): Split rent, utilities, groceries, and cleaning check fines in college apartments (Provo/Orem, BYU/UVU)

## Blog

${blogLines}

## Quick Facts

- **Price**: Free (Pro plan at $3.99/month for receipt scanning and reminders)
- **Platform**: Web browser — works on any device, no download needed
- **Auth**: No account required to join a tab; optional email/Google signup
- **Settlement**: Greedy algorithm that minimizes the number of payments
- **Pro Features**: AI receipt scanning, item-level claiming, payment reminders

## Legal

- [Privacy Policy](${BASE}/privacy)
- [Terms of Service](${BASE}/terms)

## RSS

- [Blog RSS Feed](${BASE}/blog/feed.xml): Subscribe to get new blog posts about expense splitting tips, guides, and advice
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}
