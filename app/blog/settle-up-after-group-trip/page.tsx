import type { Metadata } from "next";
import Link from "next/link";

import { AuthorBio } from "@/app/components/AuthorBio";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "How to Settle Up After a Group Trip (Without 50 Venmo Transactions) | PartyTab",
    description:
        "Minimize group payments and settle vacation expenses the smart way. Learn the greedy algorithm for settling up with fewer transactions.",
    keywords: [
        "settle up after vacation",
        "minimize payments group trip",
        "who owes who after trip",
        "settle group expenses",
        "simplify group payments",
    ],
    openGraph: {
        type: "article",
        title: "How to Settle Up After a Group Trip (Without 50 Venmo Transactions)",
        description: "The math behind settling group expenses with minimal payments.",
        url: "https://partytab.app/blog/settle-up-after-group-trip",
        images: OG_IMAGE,
    },
    twitter: {
        card: "summary_large_image",
        title: "How to Settle Up After a Group Trip (Without 50 Venmo Transactions)",
        description: "The math behind settling group expenses with minimal payments.",
        images: TWITTER_IMAGE,
    },
    alternates: {
        canonical: "https://partytab.app/blog/settle-up-after-group-trip",
    },
};

export default function SettleUpAfterGroupTripPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="How to Settle Up After a Group Trip (Without 50 Venmo Transactions)"
                description="Minimize group payments and settle vacation expenses the smart way. Learn the greedy algorithm for settling up with fewer transactions."
                slug="settle-up-after-group-trip"
                datePublished="2026-04-09"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Settle Up After Group Trip", url: "https://partytab.app/blog/settle-up-after-group-trip" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Settle Up After Group Trip</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        GUIDE
                    </span>
                    <span className="text-sm text-ink-400">April 9, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">7 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    How to Settle Up After a Group Trip (Without 50 Venmo Transactions)
                </h1>
                <p className="text-xl text-ink-600">
                    The trip was amazing. Now you&apos;re staring at 47 expenses and trying to
                    figure out who owes who. Here&apos;s the smart way to settle up.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    You just got back from an incredible week with friends. The photos are
                    perfect. The memories are priceless. And the expense tracking spreadsheet
                    looks like a crime scene.
                </p>
                <p>
                    One person paid for the Airbnb. Another covered groceries. Someone else
                    got gas three times. The restaurant bills were split across four
                    different credit cards. Now everyone&apos;s waiting to find out: who owes
                    who, and how much?
                </p>
                <p>
                    Here&apos;s how to settle up the smart way—with the fewest payments possible.
                </p>

                <h2 id="math-problem" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Math Problem
                </h2>
                <p>
                    With N people and M expenses, the number of possible debts is N×(N-1).
                    For 8 people, that&apos;s 56 potential transactions. If everyone just paid
                    back each person individually for each thing, you&apos;d be Venmo-ing people
                    for weeks.
                </p>
                <p>
                    The good news: you can almost always reduce this to <strong>N-1 payments
                    or fewer</strong> using settlement optimization.
                </p>
                <p>
                    Instead of Alice paying Bob, Carol, and Dan separately, we calculate
                    everyone&apos;s net balance and match debtors to creditors efficiently.
                </p>

                <h2 id="how-it-works" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    How Settlement Optimization Works
                </h2>
                <p>
                    The algorithm is called the <strong>greedy method</strong>. Here&apos;s how it
                    works in plain English:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Calculate each person&apos;s net balance (what they paid minus their fair share)</li>
                    <li>Identify who owes money (negative balance) and who is owed (positive balance)</li>
                    <li>Match the largest debtor with the largest creditor</li>
                    <li>Settle that debt (or as much of it as possible)</li>
                    <li>Repeat until everyone is settled</li>
                </ol>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Worked Example: 4 Friends
                </h3>
                <p>
                    <strong>Trip expenses:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Airbnb: $800 (Alice paid)</li>
                    <li>Groceries: $200 (Bob paid)</li>
                    <li>Gas: $100 (Carol paid)</li>
                    <li>Dinner: $300 (Dan paid)</li>
                </ul>
                <p>
                    <strong>Total:</strong> $1,400 ÷ 4 people = $350 per person fair share
                </p>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Person</th>
                                <th className="text-right py-2">Paid</th>
                                <th className="text-right py-2">Fair Share</th>
                                <th className="text-right py-2">Net Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Alice</td>
                                <td className="text-right py-2">$800</td>
                                <td className="text-right py-2">$350</td>
                                <td className="text-right py-2 text-teal-700">+$450</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Bob</td>
                                <td className="text-right py-2">$200</td>
                                <td className="text-right py-2">$350</td>
                                <td className="text-right py-2 text-red-700">-$150</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Carol</td>
                                <td className="text-right py-2">$100</td>
                                <td className="text-right py-2">$350</td>
                                <td className="text-right py-2 text-red-700">-$250</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Dan</td>
                                <td className="text-right py-2">$300</td>
                                <td className="text-right py-2">$350</td>
                                <td className="text-right py-2 text-red-700">-$50</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    <strong>Greedy algorithm steps:</strong>
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Largest creditor: Alice (+$450)</li>
                    <li>Largest debtor: Carol (-$250)</li>
                    <li><strong>Payment 1:</strong> Carol pays Alice $250 → Carol settled, Alice now +$200</li>
                    <li>Next largest debtor: Bob (-$150)</li>
                    <li><strong>Payment 2:</strong> Bob pays Alice $150 → Bob settled, Alice now +$50</li>
                    <li>Last debtor: Dan (-$50)</li>
                    <li><strong>Payment 3:</strong> Dan pays Alice $50 → Everyone settled</li>
                </ol>

                <p>
                    <strong>Result:</strong> 3 payments instead of 12 possible individual transactions.
                </p>

                <h2 id="manual-steps" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step-by-Step: Settling Up Manually
                </h2>
                <p>
                    If you tracked expenses in a spreadsheet (or shoebox of receipts), here&apos;s
                    how to calculate settlement yourself:
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Step 1: Total All Expenses
                </h3>
                <p>
                    Add up every expense that was shared. Don&apos;t include individual purchases
                    like someone&apos;s solo museum ticket or spa treatment.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Step 2: Calculate Each Person&apos;s Fair Share
                </h3>
                <p>
                    If you split everything evenly: Total ÷ Number of people = Fair share
                </p>
                <p>
                    If some expenses were only split among certain people (e.g., 4 people
                    went to dinner but 2 skipped), calculate fair share per expense then sum
                    them.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Step 3: Sum What Each Person Actually Paid
                </h3>
                <p>
                    Go through all expenses and add up how much each person paid out of pocket.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Step 4: Calculate Net Balance
                </h3>
                <p>
                    For each person: <strong>Paid - Fair Share = Net Balance</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Positive number = they&apos;re owed money</li>
                    <li>Negative number = they owe money</li>
                    <li>Zero = they&apos;re settled</li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">💡 Sanity check</p>
                    <p className="text-amber-700 text-sm">
                        The sum of all net balances should be zero. If it&apos;s not, you made a
                        math error—go back and check your numbers.
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Step 5: Match Debtors to Creditors
                </h3>
                <p>
                    Use the greedy method above: match the person who owes the most with the
                    person who is owed the most. Create a payment. Repeat.
                </p>

                <h2 id="app-steps" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Step-by-Step: Settling Up with an App
                </h2>
                <p>
                    If you tracked expenses during the trip with an app (the smart move),
                    settling up is dramatically simpler:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li><strong>During the trip:</strong> Everyone logs shared expenses as they happen</li>
                    <li><strong>End of trip:</strong> Open the app and click &quot;Settle Up&quot;</li>
                    <li><strong>App calculates:</strong> Net balances and optimized payments automatically</li>
                    <li><strong>Send payments:</strong> Venmo/Zelle/Cash App based on the app&apos;s suggestions</li>
                    <li><strong>Mark as paid:</strong> Everyone confirms they&apos;ve received payment</li>
                </ol>
                <p>
                    No spreadsheets. No arguments about whether someone paid for gas twice or
                    once. Just clean, optimized settlement.
                </p>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 Settle up the smart way
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        PartyTab calculates the minimum number of payments needed—no spreadsheet
                        required. Everyone logs expenses during the trip, then at the end you
                        get a clean settlement plan. One click, done.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        Create a trip tab →
                    </Link>
                </div>

                <h2 id="deadline" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Set a Deadline (and Stick to It)
                </h2>
                <p>
                    The #1 reason group trip expenses turn into drama: people don&apos;t pay
                    promptly.
                </p>
                <p>
                    <strong>Best practice:</strong> Settle within <strong>one week</strong> of
                    returning home. Ideally, settle at the airport or on the last day of the
                    trip while everyone&apos;s still together.
                </p>
                <p>
                    The longer you wait, the more likely:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>People &quot;forget&quot; (convenient)</li>
                    <li>Someone disputes an expense</li>
                    <li>The person who fronted money gets increasingly annoyed</li>
                    <li>Passive-aggressive group chat messages start</li>
                </ul>
                <p>
                    Set the expectation upfront: &quot;We&apos;ll settle up by [date]. Please have
                    everyone paid by then.&quot;
                </p>

                <h2 id="common-mistakes" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Common Settlement Mistakes
                </h2>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Mistake 1: Chasing Small Amounts
                </h3>
                <p>
                    If someone owes $3.42, let it go. Your friendship is worth more than a
                    coffee. Set a threshold (e.g., &quot;amounts under $5 are waived&quot;) and move on.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Mistake 2: Forgetting to Include Fees
                </h3>
                <p>
                    Airbnb charges a service fee. Restaurants add tax and automatic gratuity.
                    Rental cars have hidden fees. Include the actual charged amount, not just
                    the base price.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Mistake 3: Settling Before All Expenses Are In
                </h3>
                <p>
                    Wait until everyone&apos;s credit card statements have posted. The last thing
                    you want is to settle up, then realize someone forgot to log the $200
                    taxi to the airport.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Mistake 4: Using Too Many Payment Apps
                </h3>
                <p>
                    Pick one method (Venmo, Zelle, Cash App, PayPal) and have everyone use
                    it. Don&apos;t make people juggle five different apps.
                </p>

                <h2 id="example-settlement" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Real Example: 6-Person Trip Settlement
                </h2>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Person</th>
                                <th className="text-right py-2">Paid</th>
                                <th className="text-right py-2">Owes</th>
                                <th className="text-right py-2">Net</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Alice</td>
                                <td className="text-right py-2">$1,200</td>
                                <td className="text-right py-2">$450</td>
                                <td className="text-right py-2 text-teal-700">+$750</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Bob</td>
                                <td className="text-right py-2">$800</td>
                                <td className="text-right py-2">$450</td>
                                <td className="text-right py-2 text-teal-700">+$350</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Carol</td>
                                <td className="text-right py-2">$150</td>
                                <td className="text-right py-2">$450</td>
                                <td className="text-right py-2 text-red-700">-$300</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Dan</td>
                                <td className="text-right py-2">$300</td>
                                <td className="text-right py-2">$450</td>
                                <td className="text-right py-2 text-red-700">-$150</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Eve</td>
                                <td className="text-right py-2">$200</td>
                                <td className="text-right py-2">$450</td>
                                <td className="text-right py-2 text-red-700">-$250</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Frank</td>
                                <td className="text-right py-2">$50</td>
                                <td className="text-right py-2">$450</td>
                                <td className="text-right py-2 text-red-700">-$400</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    <strong>Optimized settlement plan:</strong>
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Frank pays Alice $400</li>
                    <li>Carol pays Alice $300</li>
                    <li>Eve pays Bob $250</li>
                    <li>Dan pays Bob $100</li>
                    <li>Dan pays Alice $50</li>
                </ol>
                <p>
                    <strong>5 payments</strong> instead of up to 30 individual transactions.
                </p>
            </div>


            <div className="mt-12 mb-8">
                <AuthorBio />
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Settle up the smart way
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Track expenses during the trip, get an optimized settlement plan at
                        the end. No spreadsheets, no arguments.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start Your Trip Tab →
                    </Link>
                    <p className="text-sm text-ink-400 mt-3">
                        Free. No app download needed.
                    </p>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/blog/group-vacation-budget-methods"
                        className="block p-4 border border-sand-200 rounded-xl hover:border-teal-300 transition-colors"
                    >
                        <span className="text-xs text-teal-600 font-semibold">COMPARISON</span>
                        <h4 className="font-semibold text-ink-900 mt-1">
                            Group Vacation Budget Methods
                        </h4>
                    </Link>
                    <Link
                        href="/blog/ski-trip-budget-guide"
                        className="block p-4 border border-sand-200 rounded-xl hover:border-teal-300 transition-colors"
                    >
                        <span className="text-xs text-teal-600 font-semibold">GUIDE</span>
                        <h4 className="font-semibold text-ink-900 mt-1">
                            Ski Trip Budget Guide
                        </h4>
                    </Link>
                </div>
            </div>
        </article>
    );
}
