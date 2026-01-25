import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "The Ultimate Bachelorette Party Budget Guide (2026) | PartyTab",
    description:
        "Planning a bachelorette party? Here's how to budget for the bride tribe, split costs fairly, and throw an unforgettable celebration without breaking the bank.",
    keywords: [
        "bachelorette party budget",
        "bachelorette party cost",
        "how much to spend bachelorette",
        "split bachelorette expenses",
        "maid of honor budget",
        "bachelorette weekend cost",
    ],
    openGraph: {
        title: "The Ultimate Bachelorette Party Budget Guide (2026)",
        description: "Budget tips and cost splitting for the perfect send-off.",
        url: "https://partytab.app/blog/bachelorette-party-budget-guide",
    },
    alternates: {
        canonical: "https://partytab.app/blog/bachelorette-party-budget-guide",
    },
};

export default function BachelorettePartyBudgetGuidePage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Bachelorette Budget Guide</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        GUIDE
                    </span>
                    <span className="text-sm text-ink-400">January 9, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">7 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    The Ultimate Bachelorette Party Budget Guide
                </h1>
                <p className="text-xl text-ink-600">
                    How to give the bride-to-be an amazing send-off without anyone
                    going into debt.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    Bachelorette parties have gotten... extra. Instagram-worthy destination
                    weekends, matching outfits, professional photographers, custom merch—
                    it&apos;s easy for costs to spiral into the thousands.
                </p>
                <p>
                    But here&apos;s the thing: an amazing bachelorette doesn&apos;t require a
                    second mortgage. This guide will help you plan something memorable
                    while keeping costs reasonable.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    What Does a Bachelorette Party Actually Cost?
                </h2>
                <p>Typical price ranges per person:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Local night out:</strong> $100–$300</li>
                    <li><strong>Weekend getaway (nearby):</strong> $400–$800</li>
                    <li><strong>Destination weekend (Nashville, Miami, Austin):</strong> $800–$2,000</li>
                    <li><strong>International trip:</strong> $2,000–$5,000+</li>
                </ul>
                <p>
                    The bride typically doesn&apos;t pay for shared expenses. Her portion
                    gets split among the bridesmaids, adding 10–15% to everyone else&apos;s
                    costs.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step 1: Find Out What Everyone Can Afford
                </h2>
                <p>
                    Before pinning Scottsdale pool party ideas, get real numbers from the
                    group. Send an anonymous survey or just ask outright.
                </p>
                <p>
                    <strong>Use the lowest comfortable number.</strong> If 7 people can
                    afford $1,500 and 2 can only do $600, plan for $600. Nobody should stay
                    home because they can&apos;t afford to celebrate their friend.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">🎯 MOH advice</p>
                    <p className="text-amber-700 text-sm">
                        It&apos;s better to have a smaller, in-budget celebration than one
                        where half the group quietly resents the expense for months.
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step 2: Decide What the Bride Pays For
                </h2>
                <p>Traditional etiquette says the bride doesn&apos;t pay for:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Her share of lodging</li>
                    <li>Her share of activities and group meals</li>
                    <li>Drinks (within reason—each person buying her a round is typical)</li>
                </ul>
                <p>
                    <strong>The bride usually pays for:</strong> Her own flights, personal
                    spa treatments, and shopping.
                </p>
                <p>
                    Communicate this clearly before the trip. Some brides want to pay
                    their share; let her make that choice.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step 3: Create a Budget Breakdown
                </h2>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6 overflow-x-auto">
                    <h4 className="font-semibold text-ink-900 mb-4">Sample: Austin Weekend (8 people, 2 nights)</h4>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Expense</th>
                                <th className="text-right py-2">Total</th>
                                <th className="text-right py-2">Per Person</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Airbnb (2 nights)</td>
                                <td className="text-right py-2">$1,200</td>
                                <td className="text-right py-2">$150</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Pool party cabana</td>
                                <td className="text-right py-2">$400</td>
                                <td className="text-right py-2">$50</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Brunch</td>
                                <td className="text-right py-2">$400</td>
                                <td className="text-right py-2">$50</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Nice dinner</td>
                                <td className="text-right py-2">$800</td>
                                <td className="text-right py-2">$100</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Bar night</td>
                                <td className="text-right py-2">$600</td>
                                <td className="text-right py-2">$75</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Decorations & supplies</td>
                                <td className="text-right py-2">$160</td>
                                <td className="text-right py-2">$20</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Groceries & drinks</td>
                                <td className="text-right py-2">$240</td>
                                <td className="text-right py-2">$30</td>
                            </tr>
                            <tr className="font-semibold">
                                <td className="py-2">SUBTOTAL</td>
                                <td className="text-right py-2">$3,800</td>
                                <td className="text-right py-2">$475</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="text-xs text-ink-500 mt-4">
                        *Add ~$70 per person to cover the bride&apos;s share = ~$545 total per bridesmaid
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step 4: Collect Deposits Early
                </h2>
                <p>
                    Before booking anything major, collect deposits. This confirms
                    commitment and prevents one person from fronting thousands of dollars.
                </p>
                <p>
                    A typical approach: 50% upfront when booking, 50% a week before the
                    trip.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step 5: Track Expenses During the Trip
                </h2>
                <p>
                    Once you&apos;re there, expenses fly. One person grabs the Uber, another
                    puts the dinner on her card, someone else buys the penis straws.
                </p>
                <p>
                    <strong>Log everything in real-time.</strong> Don&apos;t rely on memory.
                </p>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 Perfect for bachelorette groups
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        PartyTab works right in everyone&apos;s browser—no app downloads. Create
                        a tab, share the link to your group chat, and anyone can add
                        expenses. At the end, see exactly who owes who.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        Create a bachelorette tab →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Tips for Saving Money
                </h2>
                <ul className="list-disc pl-6 space-y-3">
                    <li>
                        <strong>Book accommodations with a kitchen.</strong> Eating in for
                        breakfast saves $20–$40 per person per day.
                    </li>
                    <li>
                        <strong>Skip matching outfits.</strong> Or just do matching shirts
                        instead of full getups.
                    </li>
                    <li>
                        <strong>Pre-game at the house.</strong> One cocktail at the bar =
                        one whole bottle at the Airbnb.
                    </li>
                    <li>
                        <strong>Look for free activities.</strong> Beach days, hiking, pool
                        hangs—not everything needs to cost money.
                    </li>
                    <li>
                        <strong>Go off-peak.</strong> Shoulder season prices are often
                        30–40% cheaper.
                    </li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    What If Someone Can&apos;t Afford It?
                </h2>
                <p>
                    Life happens. If a bridesmaid is struggling, the MOH should quietly
                    check in. Options:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Others can contribute toward her share</li>
                    <li>She can join for part of the trip</li>
                    <li>The group can scale back to something everyone can afford</li>
                </ul>
                <p>
                    No one should go into debt or feel excluded from celebrating their
                    friend.
                </p>
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Planning a bachelorette?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Track expenses and split costs with zero drama.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start Your Bachelorette Tab →
                    </Link>
                </div>
            </div>
        </article>
    );
}
