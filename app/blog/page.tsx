import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "./posts";

// Revalidate daily so scheduled posts appear on their publish date
export const revalidate = 86400;

export const metadata: Metadata = {
    title: "PartyTab Blog - Tips for Splitting Expenses with Friends",
    description:
        "Tips, guides, and stories about splitting expenses with friends. Learn the best ways to handle group costs for trips, roommates, and more.",
    openGraph: {
        title: "PartyTab Blog - Expense Splitting Tips & Guides",
        description: "Learn the best ways to split expenses with friends.",
        url: "https://partytab.app/blog",
    },
    alternates: {
        canonical: "https://partytab.app/blog",
    },
};

export default function BlogPage() {
    const publishedPosts = getPublishedPosts();

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Blog</span>
            </nav>

            {/* Hero */}
            <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
                    The PartyTab <span className="text-teal-600">Blog</span>
                </h1>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                    Tips, guides, and real talk about splitting expenses with friends—
                    without the awkwardness.
                </p>
            </div>

            {/* Blog Posts */}
            <div className="space-y-8 mb-16">
                {publishedPosts.map((post) => (
                    <article
                        key={post.slug}
                        className="bg-white rounded-2xl p-6 border border-sand-200 hover:border-teal-200 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                                {post.category}
                            </span>
                            <span className="text-xs text-ink-400">{post.date}</span>
                            <span className="text-xs text-ink-400">•</span>
                            <span className="text-xs text-ink-400">{post.readTime}</span>
                        </div>
                        <h2 className="text-xl font-bold text-ink-900 mb-2 hover:text-teal-600 transition-colors">
                            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h2>
                        <p className="text-ink-600 mb-4">{post.excerpt}</p>
                        <Link
                            href={`/blog/${post.slug}`}
                            className="text-teal-600 font-medium text-sm hover:text-teal-700"
                        >
                            Read more →
                        </Link>
                    </article>
                ))}
            </div>

            {/* CTA */}
            <div className="text-center bg-ink-900 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-sand-50 mb-2">
                    Ready to split some expenses?
                </h2>
                <p className="text-ink-300 mb-6">
                    Create a tab and see how easy it can be.
                </p>
                <Link
                    href="/tabs/new"
                    className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                >
                    Start a PartyTab
                </Link>
            </div>
        </div>
    );
}
