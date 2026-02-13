import type { Metadata } from "next";
import Link from "next/link";

import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "How to Split Expenses on a Group Cruise (2026) | PartyTab",
    description:
        "Cruising with friends? Here's how to handle cabin costs, excursions, drink packages, and onboard expenses without confusion or conflict.",
    keywords: [
        "group cruise expenses",
        "split cruise costs",
        "cruise with friends budget",
        "cruise excursion splitting",
        "cruise drink package sharing",
        "group cruise tips",
    ],
    openGraph: {
        title: "How to Split Expenses on a Group Cruise",
        description: "Smart strategies for sharing costs on your next group cruise.",
        url: "https://partytab.app/blog/group-cruise-expense-splitting",
    },
    alternates: {
        canonical: "https://partytab.app/blog/group-cruise-expense-splitting",
    },
};

export default function GroupCruiseExpenseSplittingPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="How to Split Expenses on a Group Cruise (2026)"
                description="Cruising with friends? Here's how to handle cabin costs, excursions, drink packages, and onboard expenses without confusion or conflict."
                slug="group-cruise-expense-splitting"
                datePublished="2026-01-12"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Group Cruise Expenses", url: "https://partytab.app/blog/group-cruise-expense-splitting" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Group Cruise Expenses</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        GUIDE
                    </span>
                    <span className="text-sm text-ink-400">January 12, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">6 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    How to Split Expenses on a Group Cruise
                </h1>
                <p className="text-xl text-ink-600">
                    Cruises are all-inclusive—except for all the stuff that isn&apos;t.
                    Here&apos;s how to handle the shared costs.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    Cruises seem like they&apos;d be simple for group budgeting—everyone books
                    their own cabin, food is included, done. Right?
                </p>
                <p>
                    Not quite. Group excursions, shared drink packages, specialty dining,
                    port-day expenses, and the inevitable &quot;put it on my room&quot; create a
                    complex web of who-owes-who by the end of the voyage.
                </p>
                <p>
                    Here&apos;s how to keep it simple.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    What&apos;s Typically Individual vs. Shared
                </h2>

                <div className="bg-sand-50 rounded-2xl p-6 my-6">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-medium text-ink-900 mb-2">Individual (Not Shared)</p>
                            <ul className="space-y-1 text-ink-700">
                                <li>• Cabin fare</li>
                                <li>• Personal drink package</li>
                                <li>• Spa treatments</li>
                                <li>• Casino gambling</li>
                                <li>• Solo excursions</li>
                                <li>• Specialty dining (just you/your cabin)</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium text-ink-900 mb-2">Often Shared</p>
                            <ul className="space-y-1 text-ink-700">
                                <li>• Group excursions</li>
                                <li>• Pre-cruise hotel</li>
                                <li>• Airport transfers</li>
                                <li>• Port-day taxis and guides</li>
                                <li>• Group dinner reservations</li>
                                <li>• Shared supplies (sunscreen, snorkeling gear)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Handling Excursions
                </h2>
                <p>
                    Group shore excursions are where expense sharing gets real. A private
                    catamaran charter split 8 ways is way more fun (and sometimes cheaper)
                    than individual cruise line tours.
                </p>
                <p>
                    <strong>The approach:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>One person books and pays upfront</li>
                    <li>Log it immediately in your expense tracker</li>
                    <li>Only include people who are actually going</li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The &quot;Put It on My Room&quot; Problem
                </h2>
                <p>
                    On a cruise, everything goes on your room account. One person grabs a
                    round of drinks at the pool bar and charges it to their cabin. Someone
                    else puts the group&apos;s port-side lunch on theirs.
                </p>
                <p>
                    By day 5, you have no idea who owes what.
                </p>
                <p>
                    <strong>Solution:</strong> Designate a &quot;group expenses&quot; cabin (usually
                    whoever is most organized). All shared charges go there. At the end,
                    that person splits the charges among everyone.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">💡 Better solution</p>
                    <p className="text-amber-700 text-sm">
                        Log every shared expense in a tracker the moment it happens. Don&apos;t
                        wait until the final night to untangle a week&apos;s worth of charges.
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Drink Packages: To Share or Not?
                </h2>
                <p>
                    Cruise lines typically require everyone in a cabin to have a drink
                    package if one person does. But what about sharing across the group?
                </p>
                <p>
                    You can&apos;t technically &quot;share&quot; a drink package (each person needs
                    their own). But here&apos;s what often happens:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        People without packages ask package-holders to grab them a drink
                    </li>
                    <li>
                        At port, package-free people buy for the group
                    </li>
                    <li>
                        It theoretically evens out
                    </li>
                </ul>
                <p>
                    <strong>Reality:</strong> This gets messy. Easier to either have
                    everyone get packages or no one, and track non-package drinks as
                    shared expenses.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Pre- and Post-Cruise Logistics
                </h2>
                <p>
                    Flying to the port city often means shared costs:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Hotel night before:</strong> Split by room or by person</li>
                    <li><strong>Uber/taxi to port:</strong> Split among riders</li>
                    <li><strong>Shared luggage fees:</strong> If you&apos;re checking group supplies together</li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Sample Group Cruise Shared Expenses (7-day Caribbean, 6 people)
                </h2>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6 overflow-x-auto">
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
                                <td className="py-2">Pre-cruise hotel (2 rooms)</td>
                                <td className="text-right py-2">$300</td>
                                <td className="text-right py-2">$50</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Port transfers</td>
                                <td className="text-right py-2">$120</td>
                                <td className="text-right py-2">$20</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Private snorkeling tour (Day 2)</td>
                                <td className="text-right py-2">$480</td>
                                <td className="text-right py-2">$80</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Beach club day (Day 4)</td>
                                <td className="text-right py-2">$360</td>
                                <td className="text-right py-2">$60</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Shared port lunches</td>
                                <td className="text-right py-2">$240</td>
                                <td className="text-right py-2">$40</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Group specialty dinner</td>
                                <td className="text-right py-2">$300</td>
                                <td className="text-right py-2">$50</td>
                            </tr>
                            <tr className="font-semibold">
                                <td className="py-2">TOTAL SHARED</td>
                                <td className="text-right py-2">$1,800</td>
                                <td className="text-right py-2">$300</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="text-xs text-ink-500 mt-4">
                        *Individual cabin fare, drinks, gratuities extra
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Make It Easy: Track as You Go
                </h2>
                <p>
                    Cruises involve multiple port stops, excursions, and &quot;let me get
                    this&quot; moments. Trying to remember everything on debarkation day is a
                    recipe for disaster.
                </p>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 Track cruise expenses with PartyTab
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        Create a tab before you sail. Share the link to your cruise group
                        chat. Every time someone pays for something shared—excursion, lunch,
                        transfers—log it on the spot. Settle up on the last sea day.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        Create a cruise tab →
                    </Link>
                </div>
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Cruising with friends?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Track every excursion, dinner, and &quot;I&apos;ll get this round&quot; moment.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start Your Cruise Tab →
                    </Link>
                </div>
            </div>
        </article>
    );
}
