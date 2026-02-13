import type { Metadata } from "next";
import Link from "next/link";

import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "How to Split a Group Dinner Bill Without the Awkwardness | PartyTab",
    description:
        "6 ways to split a restaurant bill fairly: equal split, itemized, apps, and more. Plus how to handle the friend who always orders the expensive steak.",
    keywords: [
        "split restaurant bill",
        "group dinner bill",
        "split check app",
        "how to split dinner bill",
        "splitting the bill with friends",
        "restaurant bill calculator",
    ],
    openGraph: {
        title: "How to Split a Group Dinner Bill Without the Awkwardness",
        description: "6 methods for fair bill splitting, plus how to handle tricky situations.",
        url: "https://partytab.app/blog/splitting-group-dinner-bills",
    },
    alternates: {
        canonical: "https://partytab.app/blog/splitting-group-dinner-bills",
    },
};

export default function SplittingGroupDinnerBillsPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="How to Split a Group Dinner Bill Without the Awkwardness"
                description="6 ways to split a restaurant bill fairly: equal split, itemized, apps, and more. Plus how to handle the friend who always orders the expensive steak."
                slug="splitting-group-dinner-bills"
                datePublished="2025-12-27"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Splitting Group Dinner Bills", url: "https://partytab.app/blog/splitting-group-dinner-bills" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Splitting Group Dinner Bills</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        TIPS
                    </span>
                    <span className="text-sm text-ink-400">December 27, 2025</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">5 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    How to Split a Group Dinner Bill Without the Awkwardness
                </h1>
                <p className="text-xl text-ink-600">
                    The check arrives. Everyone stares at it. Nobody wants to be &quot;that
                    person.&quot; Here&apos;s how to handle it.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    We&apos;ve all been there. The dinner was great, the conversation was
                    flowing, and then the bill arrives. Suddenly everyone is doing mental
                    math, pretending to check their phones, or waiting for someone else to
                    take charge.
                </p>
                <p>
                    Splitting the bill shouldn&apos;t be awkward. Here are six methods, when
                    to use each, and how to handle the tricky situations.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Method 1: Split Evenly
                </h2>
                <p>
                    <strong>How it works:</strong> Divide the total (including tax and tip)
                    by the number of people. Everyone pays the same.
                </p>
                <p><strong>Best for:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Close friends who dine together regularly</li>
                    <li>When everyone ordered similarly-priced items</li>
                    <li>When the difference would only be a few dollars</li>
                </ul>
                <p><strong>The downside:</strong> The person who ordered a salad and water subsidizes the friend who had the steak and three cocktails.</p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Method 2: Pay for What You Ordered (Itemized)
                </h2>
                <p>
                    <strong>How it works:</strong> Each person pays for their own items,
                    plus a proportional share of tax and tip.
                </p>
                <p><strong>Best for:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Mixed groups (some drink, some don&apos;t)</li>
                    <li>When there&apos;s a big price disparity between orders</li>
                    <li>Work dinners with expense reports</li>
                </ul>
                <p>
                    <strong>Pro tip:</strong> Most restaurants will split the check if you
                    ask before ordering. It&apos;s much easier than dividing it up afterward.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Method 3: One Person Pays, Everyone Venmos
                </h2>
                <p>
                    <strong>How it works:</strong> One person puts the whole thing on their
                    card. Everyone else sends their share via Venmo, Zelle, or PayPal.
                </p>
                <p><strong>Best for:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Quick resolution—one transaction at the restaurant</li>
                    <li>Someone wants the credit card points</li>
                    <li>The restaurant won&apos;t split checks</li>
                </ul>
                <p>
                    <strong>The catch:</strong> Someone has to do the math and chase people
                    down for payment. And there&apos;s always that one friend who &quot;forgets&quot;
                    to Venmo.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">💡 Pro tip</p>
                    <p className="text-amber-700 text-sm">
                        Send the Venmo request from the table, before everyone leaves. People
                        pay immediately when their phones buzz.
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Method 4: Rotating Treats
                </h2>
                <p>
                    <strong>How it works:</strong> One person covers the whole bill. Next
                    time, someone else pays.
                </p>
                <p><strong>Best for:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Small groups (2–4 people) who dine frequently</li>
                    <li>Long-term friendships where it evens out</li>
                    <li>Avoiding the &quot;splitting&quot; conversation entirely</li>
                </ul>
                <p>
                    This only works if the dinners are roughly similar in cost and
                    everyone gets their turn. It falls apart with inconsistent attendance
                    or wildly different restaurant choices.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Method 5: Shared Expense App
                </h2>
                <p>
                    <strong>How it works:</strong> Use an app to log the expense and split
                    it however you want. Great for ongoing groups or trips where there are
                    multiple expenses to track.
                </p>
                <p><strong>Best for:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Recurring dinner groups</li>
                    <li>Trips with multiple meals</li>
                    <li>When different people cover different expenses</li>
                </ul>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 PartyTab handles this perfectly
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        Add the dinner expense, tag who participated, and PartyTab calculates
                        who owes who. Works for one-off dinners or entire trips. No app
                        download needed—just share a link.
                    </p>
                    <Link
                        href="/use-cases/group-dinners"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        See how it works →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Method 6: The &quot;Close Enough&quot; Method
                </h2>
                <p>
                    <strong>How it works:</strong> Everyone throws in what they think they
                    owe (cash or cards). If it&apos;s close enough, done. If not, someone covers
                    the difference.
                </p>
                <p>
                    This is how most casual friend groups actually operate. It&apos;s not
                    mathematically perfect, but it avoids the awkwardness of calculating
                    exactly who owes $37.42.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Handling Tricky Situations
                </h2>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    The friend who always orders expensive
                </h3>
                <p>
                    If someone consistently orders the $75 steak while everyone else gets
                    pasta, switch to itemized splitting. You don&apos;t need to make it weird—
                    just say &quot;Let&apos;s pay for what we ordered&quot; when the bill comes.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Someone didn&apos;t drink
                </h3>
                <p>
                    Alcohol often makes up 30–50% of a dinner bill. If someone didn&apos;t
                    drink, splitting the bar tab evenly is genuinely unfair. Split food
                    evenly, then divide drinks among drinkers only.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    One person is really broke
                </h3>
                <p>
                    If a friend is going through a tough time, it&apos;s okay to quietly cover
                    their share. Do it privately—&quot;Hey, I got you tonight, don&apos;t worry about
                    it&quot;—rather than making a scene.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    The birthday dinner problem
                </h3>
                <p>
                    Standard etiquette: the birthday person doesn&apos;t pay. Their share gets
                    split among everyone else. Decide this <em>before</em> ordering so
                    people can budget accordingly.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    On Tipping
                </h2>
                <p>
                    Don&apos;t forget: the tip should be calculated <em>before</em> you split.
                    In the US, that&apos;s 18–20% of the pre-tax subtotal.
                </p>
                <p>
                    Nothing&apos;s worse than everyone paying their &quot;share&quot; and somehow only
                    leaving a 10% tip because nobody accounted for it properly.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Bottom Line
                </h2>
                <p>
                    The best method is the one everyone agrees on <em>before</em> the bill
                    arrives. If you&apos;re organizing the dinner, a quick &quot;we&apos;ll split
                    evenly&quot; or &quot;pay for what you ordered&quot; sets expectations upfront.
                </p>
                <p>
                    Most of the time, people aren&apos;t trying to take advantage—they just
                    don&apos;t know what&apos;s expected. A little clarity goes a long way.
                </p>
            </div>

            {/* Author / CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Going to dinner with friends?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Log the bill, split it instantly, settle with one Venmo.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start a Dinner Tab →
                    </Link>
                    <p className="text-sm text-ink-400 mt-3">Free. No app download needed.</p>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/use-cases/group-dinners"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Use Case</span>
                        <p className="font-medium text-ink-900 mt-1">
                            Group Dinner Bill Splitting
                        </p>
                    </Link>
                    <Link
                        href="/blog/splitting-rent-fairly"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Tips</span>
                        <p className="font-medium text-ink-900 mt-1">
                            How to Split Rent Fairly
                        </p>
                    </Link>
                </div>
            </div>
        </article>
    );
}
