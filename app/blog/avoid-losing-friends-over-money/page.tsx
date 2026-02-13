import type { Metadata } from "next";
import Link from "next/link";

import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "How to Avoid Losing Friends Over Money (2026) | PartyTab",
    description:
        "Money is the #1 cause of friendship conflicts. Here's how to handle shared expenses, loans between friends, and awkward money conversations without ruining relationships.",
    keywords: [
        "money and friendships",
        "lending money to friends",
        "split expenses with friends",
        "money ruins friendships",
        "awkward money conversations",
        "friends and finances",
    ],
    openGraph: {
        title: "How to Avoid Losing Friends Over Money",
        description: "Keep your friendships healthy by handling money the right way.",
        url: "https://partytab.app/blog/avoid-losing-friends-over-money",
    },
    alternates: {
        canonical: "https://partytab.app/blog/avoid-losing-friends-over-money",
    },
};

export default function AvoidLosingFriendsOverMoneyPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="How to Avoid Losing Friends Over Money (2026)"
                description="Money is the #1 cause of friendship conflicts. Here's how to handle shared expenses, loans between friends, and awkward money conversations without ruining relationships."
                slug="avoid-losing-friends-over-money"
                datePublished="2025-12-30"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Avoid Losing Friends Over Money", url: "https://partytab.app/blog/avoid-losing-friends-over-money" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Avoid Losing Friends Over Money</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        ADVICE
                    </span>
                    <span className="text-sm text-ink-400">December 30, 2025</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">7 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    How to Avoid Losing Friends Over Money
                </h1>
                <p className="text-xl text-ink-600">
                    Money is the #1 cause of friendship conflicts. Here&apos;s how to keep
                    your relationships healthy when finances get involved.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    Money and friendship are a volatile mix. A 2023 survey found that 28%
                    of people have ended a friendship over money—usually not because of
                    one big betrayal, but because of small, unaddressed resentments that
                    built up over time.
                </p>
                <p>
                    The good news: most money conflicts are preventable. Here&apos;s how to
                    navigate the tricky spots.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Golden Rule: Clarity Over Generosity
                </h2>
                <p>
                    The biggest mistake people make isn&apos;t being too cheap or too
                    generous—it&apos;s being unclear.
                </p>
                <p>
                    Vague statements like &quot;I&apos;ll cover you, don&apos;t worry about it&quot; or
                    &quot;We&apos;ll figure it out later&quot; create ambiguity. One person thinks it
                    was a gift; the other thinks it was a loan. Resentment brews.
                </p>
                <p>
                    <strong>Instead:</strong> Be explicit. &quot;I&apos;ll cover this—my treat.&quot; Or:
                    &quot;I&apos;ll spot you, just Venmo me when you can.&quot; Clear expectations
                    prevent misunderstandings.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    How to Handle Common Money Situations
                </h2>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    1. Group trips and shared expenses
                </h3>
                <p>
                    Group trips are where most money conflicts happen. Multiple expenses,
                    multiple people paying for different things, and by the end, nobody
                    knows who owes who.
                </p>
                <p><strong>The fix:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Agree on a budget before booking anything</li>
                    <li>Use an expense tracker so everyone can see who paid for what</li>
                    <li>Settle up within a week of returning home—memories fade, and so does willingness to pay</li>
                </ul>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 PartyTab was built for exactly this
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        Create a shared tab for your trip, share the link with everyone, and
                        log expenses as they happen. At the end, PartyTab calculates the
                        minimum number of payments to settle up.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        Create a trip tab →
                    </Link>
                </div>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    2. Lending money to friends
                </h3>
                <p>
                    The old saying goes: &quot;Never lend money you can&apos;t afford to lose.&quot;
                    There&apos;s wisdom in that, but sometimes friends genuinely need help.
                </p>
                <p><strong>If you decide to lend:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Only lend what you can afford to not get back</li>
                    <li>Set a specific repayment timeline (&quot;Can you pay me back by the 15th?&quot;)</li>
                    <li>Put it in writing—even a text message creates a record</li>
                    <li>If they can&apos;t pay on time, ask them to tell you proactively</li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">🎯 Reality check</p>
                    <p className="text-amber-700 text-sm">
                        If a friend asks for a loan and you&apos;d be upset if they never paid
                        it back, consider whether you truly can afford to lend. It might be
                        better to give a smaller amount as a gift than a larger amount as a
                        loan.
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    3. When a friend owes you money
                </h3>
                <p>
                    Chasing someone for money is uncomfortable. But staying silent leads
                    to resentment.
                </p>
                <p><strong>How to bring it up:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Be matter-of-fact, not accusatory: &quot;Hey, just wanted to check in on that $50 from last month&quot;</li>
                    <li>Offer an easy out: &quot;No rush if you need more time, just wanted to know where we&apos;re at&quot;</li>
                    <li>If they can&apos;t pay in full, suggest a payment plan</li>
                </ul>
                <p>
                    If they keep dodging the conversation, that tells you something about
                    the friendship—and it&apos;s worth less than the money.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    4. Income disparities in friend groups
                </h3>
                <p>
                    When one friend makes $200k and another makes $40k, group activities
                    get complicated. The higher earner might want to go to nice
                    restaurants; the lower earner might be struggling to keep up.
                </p>
                <p><strong>How to handle it:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>If you earn more:</strong> Suggest a range of activities, not
                        just expensive ones. Offer to cover sometimes, but don&apos;t make it
                        weird.
                    </li>
                    <li>
                        <strong>If you earn less:</strong> It&apos;s okay to sit out expensive
                        activities. &quot;That&apos;s out of my budget right now, but let&apos;s do
                        [cheaper alternative] soon!&quot;
                    </li>
                    <li>
                        <strong>In the group:</strong> Normalize having both fancy and
                        low-key hangouts. Not every gathering needs to cost $100/person.
                    </li>
                </ul>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    5. Weddings and expensive events
                </h3>
                <p>
                    Destination weddings, bachelor/bachelorette parties, and other big
                    events can cost hundreds or thousands of dollars. Not everyone can
                    afford that.
                </p>
                <p><strong>For the person planning:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Give people an out. &quot;We&apos;d love to have you, but no pressure if it doesn&apos;t work out.&quot;</li>
                    <li>Offer tiered participation—maybe someone can join for part of the trip, not all of it</li>
                    <li>Don&apos;t guilt-trip people who decline</li>
                </ul>
                <p><strong>For the person invited:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>It&apos;s okay to decline. A simple &quot;I can&apos;t make it work this time&quot; is enough.</li>
                    <li>If budget is the issue, say so (if you&apos;re comfortable). Real friends will understand.</li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Signs Money Is Damaging a Friendship
                </h2>
                <p>
                    Watch for these red flags:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>You feel resentful about an unresolved expense</li>
                    <li>They avoid you after you&apos;ve lent them money</li>
                    <li>You find yourself keeping a mental tally of who&apos;s paid for what</li>
                    <li>You&apos;re hesitant to invite them to things because of money issues</li>
                </ul>
                <p>
                    If you notice these, address it directly. An uncomfortable conversation
                    now is better than a lost friendship later.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    How to Have the Awkward Money Conversation
                </h2>
                <p>
                    If money tension has built up, here&apos;s a script:
                </p>
                <blockquote className="border-l-4 border-sand-300 pl-4 italic text-ink-600 my-6">
                    &quot;Hey, I want to clear the air about something. The [expense/loan]
                    from [time] has been on my mind. I don&apos;t want to make it weird, but
                    I also don&apos;t want it to come between us. Can we figure out how to
                    resolve it?&quot;
                </blockquote>
                <p>
                    This works because it:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Names the issue directly</li>
                    <li>Acknowledges the awkwardness without dramatizing it</li>
                    <li>Focuses on the relationship, not the money</li>
                    <li>Invites collaboration instead of demanding payment</li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Bottom Line
                </h2>
                <p>
                    Money doesn&apos;t have to ruin friendships. The friends you lose over
                    money usually aren&apos;t lost because of the amount—they&apos;re lost because
                    of uncommunicated expectations, avoided conversations, and built-up
                    resentment.
                </p>
                <p>
                    Be clear about expectations. Use tools to track shared expenses. Have
                    the uncomfortable conversations early. Your friendships are worth more
                    than the awkwardness.
                </p>
            </div>

            {/* Author / CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Split expenses the easy way
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Clear expense tracking = fewer awkward conversations.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start a PartyTab →
                    </Link>
                    <p className="text-sm text-ink-400 mt-3">Free. No app download needed.</p>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/blog/splitting-group-dinner-bills"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Tips</span>
                        <p className="font-medium text-ink-900 mt-1">
                            Splitting Group Dinner Bills
                        </p>
                    </Link>
                    <Link
                        href="/blog/bachelor-party-budget-guide"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Guide</span>
                        <p className="font-medium text-ink-900 mt-1">
                            Bachelor Party Budget Guide
                        </p>
                    </Link>
                </div>
            </div>
        </article>
    );
}
