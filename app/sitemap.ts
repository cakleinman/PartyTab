import { MetadataRoute } from "next";
import { getPublishedPosts } from "./blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://partytab.app";

    const blogPosts = getPublishedPosts().map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    // Blog index lastModified = most recent published post date
    const latestPostDate =
        blogPosts.length > 0
            ? blogPosts[0].lastModified
            : new Date("2026-01-01");

    return [
        {
            url: baseUrl,
            lastModified: new Date("2026-02-12"),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date("2025-01-16"),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date("2025-01-16"),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/upgrade`,
            lastModified: new Date("2026-01-01"),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        // Use case landing pages
        {
            url: `${baseUrl}/use-cases`,
            lastModified: new Date("2026-01-01"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/use-cases/bachelor-party`,
            lastModified: new Date("2026-01-01"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/use-cases/ski-trips`,
            lastModified: new Date("2026-01-01"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/use-cases/roommates`,
            lastModified: new Date("2026-01-01"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/use-cases/group-dinners`,
            lastModified: new Date("2026-01-01"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/use-cases/college-roommates`,
            lastModified: new Date("2026-02-14"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        // Informational pages
        {
            url: `${baseUrl}/how-it-works`,
            lastModified: new Date("2026-01-01"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        // Comparison pages
        {
            url: `${baseUrl}/compare/splitwise`,
            lastModified: new Date("2026-02-12"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        // Blog index
        {
            url: `${baseUrl}/blog`,
            lastModified: latestPostDate,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        // Blog posts (dynamically generated from published posts)
        ...blogPosts,
    ];
}
