import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "PartyTab Blog - Tips for Splitting Expenses with Friends",
    description:
        "Tips, guides, and stories about splitting expenses with friends. Learn the best ways to handle group costs for trips, roommates, and more.",
    openGraph: {
        title: "PartyTab Blog - Expense Splitting Tips & Guides",
        description: "Learn the best ways to split expenses with friends.",
        url: "https://partytab.app/blog",
    },
};

// These would eventually come from a CMS or MDX files
const BLOG_POSTS = [
    {
        slug: "bachelor-party-budget-guide",
        title: "The Ultimate Bachelor Party Budget Guide",
        excerpt:
            "Planning a bachelor party? Here's how to set a realistic budget, split costs fairly, and avoid awkward money conversations.",
        date: "2026-01-24",
        readTime: "8 min read",
        category: "Guides",
    },
    {
        slug: "youth-sports-travel-expenses",
        title: "Managing Youth Sports Travel Team Expenses",
        excerpt:
            "Coordinating a travel team for tournaments? Here's how parent groups can fairly split hotel rooms, gas, meals, and tournament fees.",
        date: "2026-01-21",
        readTime: "7 min read",
        category: "Guides",
    },
    {
        slug: "splitting-group-project-expenses",
        title: "How to Split Group Project Expenses Without Drama",
        excerpt:
            "Working on a group project with shared costs? Here's how to fairly split expenses for supplies, software, and food.",
        date: "2026-01-18",
        readTime: "5 min read",
        category: "Tips",
    },
    {
        slug: "ski-trip-budget-guide",
        title: "Ski Trip Budget: How to Split Costs With Your Crew",
        excerpt:
            "Lift tickets, lodging, rentals, and après-ski—here's how to keep track without wiping out.",
        date: "2026-01-15",
        readTime: "6 min read",
        category: "Guides",
    },
    {
        slug: "group-cruise-expense-splitting",
        title: "How to Split Expenses on a Group Cruise",
        excerpt:
            "Cruising with friends? Here's how to handle cabin costs, excursions, drink packages, and onboard expenses.",
        date: "2026-01-12",
        readTime: "6 min read",
        category: "Guides",
    },
    {
        slug: "bachelorette-party-budget-guide",
        title: "The Ultimate Bachelorette Party Budget Guide",
        excerpt:
            "How to give the bride-to-be an amazing send-off without anyone going into debt.",
        date: "2026-01-09",
        readTime: "7 min read",
        category: "Guides",
    },
    {
        slug: "girls-trip-budget-planning",
        title: "Girls Trip Budget Planning: Split Costs Without the Drama",
        excerpt:
            "A practical guide to planning, budgeting, and splitting expenses for your next girls getaway.",
        date: "2026-01-06",
        readTime: "6 min read",
        category: "Guides",
    },
    {
        slug: "splitting-holiday-expenses-family",
        title: "How to Split Holiday Expenses With Family",
        excerpt:
            "Family holidays get expensive fast. Here's how to fairly split costs for Thanksgiving, Christmas, or reunions.",
        date: "2026-01-03",
        readTime: "7 min read",
        category: "Guides",
    },
    {
        slug: "avoid-losing-friends-over-money",
        title: "How to Avoid Losing Friends Over Money",
        excerpt:
            "Money is the #1 cause of friendship conflicts. Here's how to handle shared expenses without ruining relationships.",
        date: "2025-12-30",
        readTime: "7 min read",
        category: "Advice",
    },
    {
        slug: "splitting-group-dinner-bills",
        title: "How to Split a Group Dinner Bill Without the Awkwardness",
        excerpt:
            "6 ways to split a restaurant bill fairly, plus how to handle the friend who always orders the expensive steak.",
        date: "2025-12-27",
        readTime: "5 min read",
        category: "Tips",
    },
    {
        slug: "splitting-rent-fairly",
        title: "How to Split Rent Fairly (When Rooms Aren't Equal)",
        excerpt:
            "The master bedroom shouldn't cost the same as the tiny room by the bathroom. 5 fair methods to split unequal rent.",
        date: "2025-12-24",
        readTime: "6 min read",
        category: "Tips",
    },
];

export default function BlogPage() {
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
                {BLOG_POSTS.map((post) => (
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
