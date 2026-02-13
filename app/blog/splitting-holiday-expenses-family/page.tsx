import type { Metadata } from "next";
import Link from "next/link";

import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "How to Split Holiday Expenses With Family (Without the Drama) | PartyTab",
    description:
        "Family holidays get expensive fast. Here's how to fairly split costs for Thanksgiving, Christmas, or family reunions without awkward money conversations.",
    keywords: [
        "split holiday expenses family",
        "family vacation cost sharing",
        "thanksgiving expense sharing",
        "christmas family trip budget",
        "family reunion costs",
        "split family trip costs",
    ],
    openGraph: {
        title: "How to Split Holiday Expenses With Family",
        description: "Fair ways to share costs at family gatherings without the drama.",
        url: "https://partytab.app/blog/splitting-holiday-expenses-family",
    },
    alternates: {
        canonical: "https://partytab.app/blog/splitting-holiday-expenses-family",
    },
};

export default function SplittingHolidayExpensesFamilyPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="How to Split Holiday Expenses With Family (Without the Drama)"
                description="Family holidays get expensive fast. Here's how to fairly split costs for Thanksgiving, Christmas, or family reunions without awkward money conversations."
                slug="splitting-holiday-expenses-family"
                datePublished="2026-01-03"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Holiday Family Expenses", url: "https://partytab.app/blog/splitting-holiday-expenses-family" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Holiday Family Expenses</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        GUIDE
                    </span>
                    <span className="text-sm text-ink-400">January 3, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">7 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    How to Split Holiday Expenses With Family (Without the Drama)
                </h1>
                <p className="text-xl text-ink-600">
                    Because nobody wants to argue about grocery receipts at the
                    Thanksgiving table.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    Family gatherings are wonderful—until someone starts calculating who
                    bought the turkey vs. who bought the wine, and why Aunt Linda hasn&apos;t
                    contributed to anything since 2019.
                </p>
                <p>
                    Whether it&apos;s Thanksgiving, Christmas, a summer reunion, or any family
                    get-together, money conversations are awkward. But they&apos;re necessary.
                    Here&apos;s how to handle them gracefully.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Fundamental Problem With Family Expenses
                </h2>
                <p>
                    Friend groups can split evenly and call it a day. Families are more
                    complicated because:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Income disparities between siblings can be huge</li>
                    <li>Households have different numbers of people (singles vs. families of 5)</li>
                    <li>Grandparents often contribute differently than adult children</li>
                    <li>Old patterns (&quot;Mom always hosts&quot;) may not be fair anymore</li>
                    <li>Nobody wants to &quot;charge&quot; their own parents</li>
                </ul>
                <p>
                    There&apos;s no one-size-fits-all solution, but here are models that work.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Model 1: Split by Household (Simple)
                </h2>
                <p>
                    <strong>How it works:</strong> Each household (not each person)
                    contributes equally to shared costs.
                </p>
                <p>
                    <strong>Best for:</strong> Families where households are roughly
                    similar in size—or where nobody wants to count heads.
                </p>
                <p>
                    <strong>Example:</strong> Three siblings each bring their families for
                    Thanksgiving. Total food cost is $600. Each household contributes
                    $200, regardless of whether they brought 2 people or 5.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Model 2: Split by Person (Fairer for Food)
                </h2>
                <p>
                    <strong>How it works:</strong> Count heads, divide costs. Kids might
                    count as half or free depending on age.
                </p>
                <p>
                    <strong>Best for:</strong> When one household is bringing 6 people and
                    another is bringing 2—and you notice the difference.
                </p>

                <div className="bg-sand-50 rounded-2xl p-6 my-6">
                    <h4 className="font-semibold text-ink-900 mb-3">Example Per-Person Split</h4>
                    <p className="text-sm text-ink-700">
                        Grocery bill: $500<br />
                        Adults: 8 ($40/each)<br />
                        Kids under 12: 5 (free or $20/each)<br />
                        <strong>Result:</strong> $320 from adults + $100 from kids families = fair split
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Model 3: Rotating Host Responsibility
                </h2>
                <p>
                    <strong>How it works:</strong> One household hosts and covers the main
                    costs (food, decorations). Each year, it rotates.
                </p>
                <p>
                    <strong>Best for:</strong> Families who gather regularly and want to
                    avoid constant calculations.
                </p>
                <p>
                    <strong>Caveat:</strong> Hosting costs vary. A summer BBQ is cheaper
                    than Christmas dinner. You might need to supplement with others
                    bringing dishes or wine.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Model 4: Potluck-Style (Everyone Brings Something)
                </h2>
                <p>
                    <strong>How it works:</strong> Instead of splitting money, each
                    household is assigned categories: main dish, sides, desserts, drinks,
                    etc.
                </p>
                <p>
                    <strong>Best for:</strong> Families where people want to contribute
                    but money discussions feel taboo.
                </p>
                <p>
                    <strong>The catch:</strong> This only covers food. Lodging for family
                    reunions or vacation rentals still needs a money discussion.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Handling Lodging for Family Vacations
                </h2>
                <p>
                    When the whole family rents a beach house or cabin, bedroom allocation
                    gets tricky. Fair approaches:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Split by bedroom:</strong> Master suite pays more than the bunk room</li>
                    <li><strong>Split by person:</strong> Each adult pays the same share</li>
                    <li><strong>Hybrid:</strong> Base cost split by household + premium for better rooms</li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">💡 Pro tip</p>
                    <p className="text-amber-700 text-sm">
                        Let the family with young kids (who are up at 6am anyway) choose
                        their room first. They&apos;ll pick based on proximity to the kitchen,
                        not luxury.
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    What About Grandparents?
                </h2>
                <p>
                    This is where it gets culturally specific. Some families:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Expect adult children to cover parents entirely (&quot;they paid for us growing up&quot;)</li>
                    <li>Have grandparents who insist on paying for everything</li>
                    <li>Include grandparents in splits like everyone else</li>
                </ul>
                <p>
                    There&apos;s no right answer—just have the conversation before booking the
                    vacation rental.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Track Expenses Transparently
                </h2>
                <p>
                    Whatever model you choose, visibility matters. When one person tracks
                    everything in their head, others suspect they&apos;re being overcharged.
                </p>
                <p>
                    Use a shared tracker where everyone can see:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>What was purchased</li>
                    <li>Who paid</li>
                    <li>How it&apos;s being split</li>
                </ul>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 Make it easy on everyone
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        Create a PartyTab for your family gathering. Share the link, and
                        anyone can add expenses—no app download needed. Even the
                        not-so-tech-savvy relatives can use it.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        Create a family expense tab →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Having the Conversation
                </h2>
                <p>
                    The best time to talk money is when you&apos;re planning, not when the
                    bill arrives. Try:
                </p>
                <blockquote className="border-l-4 border-sand-300 pl-4 italic text-ink-600 my-6">
                    &quot;Before we book anything, let&apos;s figure out how we want to split
                    costs. Are we doing per household, per person, or something else?
                    I just want everyone to feel good about it.&quot;
                </blockquote>
                <p>
                    This sets the expectation that costs <em>will</em> be split, while
                    inviting input on how.
                </p>
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Family gathering coming up?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Track holiday expenses transparently. No spreadsheets, no awkward texts.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start a Family Tab →
                    </Link>
                </div>
            </div>
        </article>
    );
}
