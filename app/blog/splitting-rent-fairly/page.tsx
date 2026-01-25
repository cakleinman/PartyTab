import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "How to Split Rent Fairly When Rooms Aren't Equal (2026) | PartyTab",
    description:
        "The master bedroom shouldn't cost the same as the tiny room by the closet. Here are 5 fair methods to split rent when bedrooms differ in size, light, or amenities.",
    keywords: [
        "split rent fairly",
        "unequal room sizes rent",
        "how to split rent",
        "rent splitting methods",
        "roommate rent calculator",
        "split rent by room size",
    ],
    openGraph: {
        title: "How to Split Rent Fairly When Rooms Aren't Equal",
        description: "5 fair methods for splitting rent with unequal bedrooms.",
        url: "https://partytab.app/blog/splitting-rent-fairly",
    },
    alternates: {
        canonical: "https://partytab.app/blog/splitting-rent-fairly",
    },
};

export default function SplittingRentFairlyPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Split Rent Fairly</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        TIPS
                    </span>
                    <span className="text-sm text-ink-400">December 24, 2025</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">6 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    How to Split Rent Fairly When Rooms Aren&apos;t Equal
                </h1>
                <p className="text-xl text-ink-600">
                    The person in the master suite shouldn&apos;t pay the same as the person
                    in the closet-sized room. Here&apos;s how to figure out what&apos;s actually fair.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    Moving in with roommates is exciting—until you realize the
                    &quot;3-bedroom apartment&quot; has one massive master suite, one
                    normal room, and one that barely fits a twin bed.
                </p>
                <p>
                    Splitting rent evenly might seem simple, but it&apos;s rarely fair when
                    rooms differ significantly. Someone ends up overpaying, resentment
                    builds, and suddenly your living situation is tense.
                </p>
                <p>
                    Here are five methods to split rent fairly, ranked from simplest to
                    most precise.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Method 1: The Square Footage Split
                </h2>
                <p>
                    <strong>How it works:</strong> Measure each bedroom&apos;s square footage
                    and divide rent proportionally.
                </p>

                <div className="bg-sand-50 rounded-2xl p-6 my-6">
                    <h4 className="font-semibold text-ink-900 mb-3">Example</h4>
                    <p className="text-sm text-ink-700 mb-4">
                        Total rent: $3,000/month<br />
                        Room A: 200 sq ft (40%)<br />
                        Room B: 150 sq ft (30%)<br />
                        Room C: 100 sq ft (20%)<br />
                        Common areas: Split equally (10% each)
                    </p>
                    <p className="text-sm text-ink-700">
                        <strong>Result:</strong> Room A pays $1,200, Room B pays $900, Room C pays $600, plus $100 each for common areas = <strong>$1,300 / $1,000 / $700</strong>
                    </p>
                </div>

                <p>
                    <strong>Pros:</strong> Objective, easy to calculate, hard to argue with.
                </p>
                <p>
                    <strong>Cons:</strong> Doesn&apos;t account for windows, closet space, or
                    en-suite bathrooms. A 150 sq ft room with natural light might be worth
                    more than a 200 sq ft dungeon.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Method 2: The Auction Method
                </h2>
                <p>
                    <strong>How it works:</strong> Each roommate secretly bids what they&apos;d
                    pay for each room. Highest bidder gets their first choice.
                </p>
                <p>
                    This is surprisingly effective because:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>It reveals what rooms are actually worth to each person</li>
                    <li>Nobody can complain—they chose their price</li>
                    <li>It accounts for personal preferences (one person might value morning light more than space)</li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">⚠️ Watch out</p>
                    <p className="text-amber-700 text-sm">
                        This works best when people have roughly similar budgets. If one
                        roommate can outbid everyone, it stops being fair.
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Method 3: The Point System
                </h2>
                <p>
                    <strong>How it works:</strong> Assign points for room features, then
                    divide rent by total points.
                </p>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6">
                    <h4 className="font-semibold text-ink-900 mb-4">Sample Point Values</h4>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Feature</th>
                                <th className="text-right py-2">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Base room</td>
                                <td className="text-right py-2">10</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">En-suite bathroom</td>
                                <td className="text-right py-2">+5</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Walk-in closet</td>
                                <td className="text-right py-2">+3</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Window with good light</td>
                                <td className="text-right py-2">+2</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Extra 50+ sq ft</td>
                                <td className="text-right py-2">+2</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Street noise</td>
                                <td className="text-right py-2">-2</td>
                            </tr>
                            <tr>
                                <td className="py-2">No closet</td>
                                <td className="text-right py-2">-3</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    This method requires agreement on point values, which can lead to
                    debate. But once you agree on the system, the math is clear.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Method 4: The Sperner&apos;s Lemma Method
                </h2>
                <p>
                    <strong>How it works:</strong> A mathematically proven fair division
                    algorithm. Each person lists what percentage of rent they&apos;d pay for
                    each room, the algorithm finds the fairest split.
                </p>
                <p>
                    Tools like the <a href="https://www.nytimes.com/interactive/2014/science/rent-division-calculator.html" className="text-teal-600 hover:underline" target="_blank" rel="noopener noreferrer">NYT Rent Calculator</a> use
                    this method. It&apos;s mathematically guaranteed to be envy-free—nobody
                    wishes they had someone else&apos;s room at that price.
                </p>
                <p>
                    <strong>Best for:</strong> Roommates who want mathematical certainty
                    and don&apos;t mind spending 15 minutes on a decision.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Method 5: The Negotiation Method
                </h2>
                <p>
                    <strong>How it works:</strong> Just... talk about it like adults.
                </p>
                <p>
                    Start with equal split, then adjust based on room differences. The
                    person in the master might offer to pay $100–$200 more; the person in
                    the small room expects a discount.
                </p>
                <p>
                    This works best when:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Everyone is reasonable and conflict-averse</li>
                    <li>The differences aren&apos;t dramatic</li>
                    <li>You&apos;ve lived together before and trust each other</li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Once You&apos;ve Decided: Track Everything
                </h2>
                <p>
                    Rent is just the beginning. Utilities, groceries, cleaning supplies,
                    streaming subscriptions—shared expenses add up fast.
                </p>
                <p>
                    The easiest approach: create a shared expense tracker where everyone
                    logs what they pay, and settle up monthly.
                </p>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 Track roommate expenses with PartyTab
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        Create a tab for your household, share the link, and everyone logs
                        expenses as they happen. At the end of the month, settle up with
                        minimal payments.
                    </p>
                    <Link
                        href="/use-cases/roommates"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        See how it works for roommates →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Final Tips
                </h2>
                <ul className="list-disc pl-6 space-y-3">
                    <li>
                        <strong>Decide before signing the lease.</strong> It&apos;s much harder
                        to renegotiate once everyone&apos;s moved in.
                    </li>
                    <li>
                        <strong>Put it in writing.</strong> A simple text or email
                        confirming the split prevents future &quot;I thought we agreed...&quot;
                        conversations.
                    </li>
                    <li>
                        <strong>Revisit annually.</strong> If someone&apos;s financial situation
                        changes or utilities spike, it&apos;s worth discussing.
                    </li>
                    <li>
                        <strong>Don&apos;t nickel-and-dime.</strong> A $20/month difference usually
                        isn&apos;t worth the friction. Pick your battles.
                    </li>
                </ul>
            </div>

            {/* Author / CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Living with roommates?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Track shared household expenses without the spreadsheet headaches.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Create a Roommate Tab →
                    </Link>
                    <p className="text-sm text-ink-400 mt-3">Free. No app download needed.</p>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/use-cases/roommates"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Use Case</span>
                        <p className="font-medium text-ink-900 mt-1">
                            Roommate Bill Splitting
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
