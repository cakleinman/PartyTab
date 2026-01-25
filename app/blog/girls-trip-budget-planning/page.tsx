import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Girls Trip Budget Planning: Split Costs & Avoid Drama | PartyTab",
    description:
        "Planning a girls trip? Here's how to budget, split costs fairly, and keep everyone happy—from choosing the destination to settling up after.",
    keywords: [
        "girls trip budget",
        "split costs girls trip",
        "girls weekend expenses",
        "girls getaway planning",
        "bff trip budget",
        "friend trip expenses",
    ],
    openGraph: {
        title: "Girls Trip Budget Planning: Split Costs & Avoid Drama",
        description: "Budget tips and expense splitting for the perfect girls getaway.",
        url: "https://partytab.app/blog/girls-trip-budget-planning",
    },
    alternates: {
        canonical: "https://partytab.app/blog/girls-trip-budget-planning",
    },
};

export default function GirlsTripBudgetPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Girls Trip Budget</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        GUIDE
                    </span>
                    <span className="text-sm text-ink-400">January 6, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">6 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    Girls Trip Budget Planning: How to Split Costs Without the Drama
                </h1>
                <p className="text-xl text-ink-600">
                    A practical guide to planning, budgeting, and splitting expenses for
                    your next girls getaway.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    Girls trips are supposed to be fun—but nothing kills the vibe faster
                    than money stress. Whether it&apos;s a wine country weekend, beach
                    vacation, or city getaway, financial miscommunication can turn best
                    friends into frenemies.
                </p>
                <p>
                    Here&apos;s how to plan a trip everyone can afford, split costs fairly,
                    and come home with your friendships intact.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step 1: Have the Budget Conversation Early
                </h2>
                <p>
                    Before anyone books flights or starts pinning Airbnbs, you need to
                    know everyone&apos;s budget. This is the most important step—and the one
                    people skip most often.
                </p>
                <p>
                    <strong>Send a quick group text:</strong> &quot;So excited for this trip!
                    What budget is everyone comfortable with? Let&apos;s plan something that
                    works for all of us.&quot;
                </p>
                <p>
                    Use the <strong>lowest comfortable number</strong> as your planning
                    ceiling. If three people can spend $1,500 and one can only do $800,
                    plan for $800. You can always add optional splurges for those who
                    want them.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step 2: Decide What&apos;s Shared vs. Individual
                </h2>
                <p>
                    Not every expense needs to be split. Agree upfront on categories:
                </p>

                <div className="bg-sand-50 rounded-2xl p-6 my-6">
                    <h4 className="font-semibold text-ink-900 mb-4">Typical Split</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-medium text-ink-900 mb-2">✓ Usually Shared</p>
                            <ul className="space-y-1 text-ink-700">
                                <li>• Accommodation</li>
                                <li>• Rental car / transportation</li>
                                <li>• Group dinners</li>
                                <li>• Shared groceries & wine</li>
                                <li>• Group activities (boat day, cooking class)</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium text-ink-900 mb-2">✗ Usually Individual</p>
                            <ul className="space-y-1 text-ink-700">
                                <li>• Flights</li>
                                <li>• Spa treatments</li>
                                <li>• Personal shopping</li>
                                <li>• Souvenirs</li>
                                <li>• Solo activities</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step 3: Collect Money Upfront for Big Expenses
                </h2>
                <p>
                    For accommodations and other big-ticket items, collect money before
                    booking. This:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Confirms who&apos;s actually committed</li>
                    <li>Prevents one person from fronting thousands of dollars</li>
                    <li>Avoids the awkward &quot;chasing people for money&quot; phase later</li>
                </ul>
                <p>
                    A simple &quot;Send $X to [person] by [date] to lock in our
                    spot&quot; works well.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step 4: Track Expenses as You Go
                </h2>
                <p>
                    Once you&apos;re on the trip, expenses pile up fast. One person grabs
                    groceries, another pays for the wine tour, someone else covers the
                    Uber.
                </p>
                <p>
                    The key: <strong>log everything in real-time</strong>. Don&apos;t trust
                    anyone to &quot;remember it later.&quot;
                </p>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 Perfect for girls trips
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        PartyTab lets everyone add expenses from their phone—no app
                        download needed. Share the link, and everyone can see who paid for
                        what. At the end, it calculates who owes who.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        Create a trip tab →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step 5: Handle the &quot;Unequal Participation&quot; Problem
                </h2>
                <p>
                    Not everyone does every activity. One person skips the wine tour
                    because she&apos;s pregnant. Another doesn&apos;t drink at all. Someone has
                    dietary restrictions that mean she eats separately sometimes.
                </p>
                <p>
                    <strong>The rule:</strong> Only split expenses among the people who
                    participated. Most expense trackers (including PartyTab) let you
                    select who an expense applies to.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step 6: Settle Up Promptly
                </h2>
                <p>
                    Within 48 hours of returning home, run the final tally and send
                    payment requests. The longer you wait, the less likely people are to
                    pay (and the more awkward it gets).
                </p>
                <p>
                    Pro tip: Settle while still at the airport or right after the goodbye
                    hugs. Everyone&apos;s still in &quot;trip mode&quot; and their phones are out.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Common Girls Trip Budget Mistakes
                </h2>
                <ul className="list-disc pl-6 space-y-3">
                    <li>
                        <strong>Planning for the richest friend&apos;s budget.</strong> You&apos;ll
                        end up making someone uncomfortable or excluded.
                    </li>
                    <li>
                        <strong>Not discussing alcohol.</strong> Some people drink a lot
                        more than others. Agree upfront if bar tabs will be split evenly or
                        individually.
                    </li>
                    <li>
                        <strong>Assuming &quot;we&apos;ll figure it out.&quot;</strong> You won&apos;t. Use
                        a tracker.
                    </li>
                    <li>
                        <strong>Letting resentment build.</strong> If something feels
                        unfair, say it kindly and early.
                    </li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Sample Girls Trip Budget (4 people, 3 nights)
                </h2>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Category</th>
                                <th className="text-right py-2">Total</th>
                                <th className="text-right py-2">Per Person</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Airbnb (3 nights)</td>
                                <td className="text-right py-2">$800</td>
                                <td className="text-right py-2">$200</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Rental car</td>
                                <td className="text-right py-2">$200</td>
                                <td className="text-right py-2">$50</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Groceries & wine</td>
                                <td className="text-right py-2">$300</td>
                                <td className="text-right py-2">$75</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Group dinner (1 fancy)</td>
                                <td className="text-right py-2">$400</td>
                                <td className="text-right py-2">$100</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Wine tour</td>
                                <td className="text-right py-2">$240</td>
                                <td className="text-right py-2">$60</td>
                            </tr>
                            <tr className="font-semibold">
                                <td className="py-2">TOTAL SHARED</td>
                                <td className="text-right py-2">$1,940</td>
                                <td className="text-right py-2">$485</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="text-xs text-ink-500 mt-4">
                        *Flights, spa, shopping extra—budget $500–$800 total per person
                    </p>
                </div>
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Planning a girls trip?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Track expenses, split fairly, keep the drama on the reality TV—not
                        in your friend group.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start Your Trip Tab →
                    </Link>
                </div>
            </div>
        </article>
    );
}
