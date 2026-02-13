import { getPublishedPosts } from "@/app/blog/posts";

export async function GET() {
  const posts = getPublishedPosts();
  const baseUrl = "https://partytab.app";

  // Convert ISO date to RFC 822 format for RSS
  const toRFC822 = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toUTCString();
  };

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PartyTab Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Tips, guides, and advice about splitting expenses with friends</description>
    <language>en-us</language>
    <lastBuildDate>${toRFC822(new Date().toISOString())}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml" />
${posts
  .map(
    (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${toRFC822(post.date)}</pubDate>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <category>${escapeXml(post.category)}</category>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}

// Helper to escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
