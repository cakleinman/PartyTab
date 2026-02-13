import { MetadataRoute } from "next";
import { getPublishedPosts } from "./blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://partytab.app";
    const now = new Date();

    const blogPosts = getPublishedPosts().map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/upgrade`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        // Use case landing pages
        {
            url: `${baseUrl}/use-cases`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/use-cases/bachelor-party`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/use-cases/ski-trips`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/use-cases/roommates`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/use-cases/group-dinners`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        // Informational pages
        {
            url: `${baseUrl}/how-it-works`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        // Comparison pages
        {
            url: `${baseUrl}/compare/splitwise`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        // Blog index
        {
            url: `${baseUrl}/blog`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        // Blog posts (dynamically generated from published posts)
        ...blogPosts,
    ];
}
