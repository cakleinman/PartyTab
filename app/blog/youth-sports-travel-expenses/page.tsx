import type { Metadata } from "next";
import Link from "next/link";

import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "How to Manage Youth Sports Travel Team Expenses | PartyTab",
    description:
        "Coordinating a travel team for tournaments? Here's how parent groups can fairly split hotel rooms, gas, meals, and tournament fees without the headaches.",
    keywords: [
        "youth sports travel expenses",
        "travel team budget",
        "tournament trip costs",
        "sports parent expense sharing",
        "kids travel team logistics",
        "youth athletic travel",
    ],
    openGraph: {
        title: "How to Manage Youth Sports Travel Team Expenses",
        description: "Parent-tested tips for splitting travel team costs fairly.",
        url: "https://partytab.app/blog/youth-sports-travel-expenses",
    },
    alternates: {
        canonical: "https://partytab.app/blog/youth-sports-travel-expenses",
    },
};

export default function YouthSportsTravelExpensesPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="How to Manage Youth Sports Travel Team Expenses"
                description="Coordinating a travel team for tournaments? Here's how parent groups can fairly split hotel rooms, gas, meals, and tournament fees without the headaches."
                slug="youth-sports-travel-expenses"
                datePublished="2026-01-21"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Youth Sports Travel", url: "https://partytab.app/blog/youth-sports-travel-expenses" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Youth Sports Travel</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        GUIDE
                    </span>
                    <span className="text-sm text-ink-400">January 21, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">7 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    Managing Youth Sports Travel Team Expenses
                </h1>
                <p className="text-xl text-ink-600">
                    Tournaments, hotels, gas money—a parent&apos;s guide to splitting travel
                    team costs without the drama.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    If your kid plays travel baseball, club soccer, competitive
                    volleyball, or any other travel sport, you know the drill: weekend
                    tournaments mean coordinating hotels, carpools, meals, and shared
                    expenses among multiple families.
                </p>
                <p>
                    It&apos;s a logistical nightmare—and money conversations between parents
                    can get awkward fast. Here&apos;s how to handle it like a pro.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Common Travel Team Expenses
                </h2>
                <p>
                    Tournament weekends typically involve:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Hotel rooms:</strong> Often shared between families</li>
                    <li><strong>Gas / transportation:</strong> Carpooling to save costs</li>
                    <li><strong>Tournament entry fees:</strong> Usually handled by the team</li>
                    <li><strong>Team meals:</strong> Group dinners, post-game pizza</li>
                    <li><strong>Snacks & supplies:</strong> Cooler duty, drinks, tournament snacks</li>
                    <li><strong>Coach expenses:</strong> Sometimes covered by parent pool</li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Hotel Room Sharing: The Main Challenge
                </h2>
                <p>
                    Many families share hotel rooms to cut costs. This creates
                    questions:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>How do we split a room with 2 families?</li>
                    <li>What if one family has 2 kids and another has 1?</li>
                    <li>What if someone books a nicer room?</li>
                </ul>

                <p><strong>Common approaches:</strong></p>

                <div className="bg-sand-50 rounded-2xl p-6 my-6">
                    <h4 className="font-semibold text-ink-900 mb-3">Room Splitting Options</h4>
                    <ul className="space-y-2 text-sm text-ink-700">
                        <li>
                            <strong>Split 50/50 by family:</strong> Simple. Each family pays
                            half regardless of family size.
                        </li>
                        <li>
                            <strong>Split by person:</strong> More precise. A family of 4
                            pays more than a family of 2.
                        </li>
                        <li>
                            <strong>Adults only:</strong> Each adult counts; kids are free.
                            Common if rooms would fit all kids anyway.
                        </li>
                    </ul>
                </div>

                <p>
                    Whatever you choose, agree on it <strong>before booking</strong>.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Carpooling and Gas Money
                </h2>
                <p>
                    When multiple families carpool to a tournament, gas should be split
                    fairly. But &quot;fairly&quot; means different things to different people.
                </p>
                <p>
                    <strong>Simple approach:</strong> Calculate total gas cost (miles ÷
                    MPG × gas price) and split by number of people riding.
                </p>
                <p>
                    <strong>Even simpler:</strong> The IRS mileage rate (~67¢/mile in
                    2026) factors in gas, wear, and tear. Split that among riders.
                </p>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6">
                    <h4 className="font-semibold text-ink-900 mb-3">Quick Gas Math</h4>
                    <p className="text-sm text-ink-700">
                        Round trip: 200 miles<br />
                        Rate: $0.67/mile<br />
                        Total: $134<br />
                        Split among 4 adults: <strong>$33.50 each</strong>
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Team Meals and Snacks
                </h2>
                <p>
                    Post-game pizza, tournament morning bagels, the team snack
                    cooler—these shared expenses add up.
                </p>
                <p>
                    <strong>Options:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Rotating duty:</strong> Each family takes a turn bringing
                        snacks/drinks. No money changes hands.
                    </li>
                    <li>
                        <strong>Shared fund:</strong> Everyone puts in $20/tournament for
                        group food. Manager handles purchases.
                    </li>
                    <li>
                        <strong>Track and split:</strong> Log each purchase, split at end.
                    </li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Designate a Team Treasurer
                </h2>
                <p>
                    Someone needs to be in charge of collecting and tracking team
                    expenses. This is usually a parent volunteer (often called the Team
                    Manager or Team Treasurer).
                </p>
                <p>
                    <strong>Their job:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Collect deposits for hotels and tournaments</li>
                    <li>Track shared expenses</li>
                    <li>Send out bills/splits after each tournament</li>
                    <li>Chase down the family that always &quot;forgets&quot; to pay</li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">🏆 Pro tip</p>
                    <p className="text-amber-700 text-sm">
                        Send payment requests within 48 hours of returning home. The
                        longer you wait, the harder it is to collect—and the more awkward
                        it becomes.
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Use a Shared Expense Tracker
                </h2>
                <p>
                    Spreadsheets work, but they&apos;re clunky for multiple people to update.
                    A shared expense app lets everyone log purchases in real-time and
                    see exactly who owes what.
                </p>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 Perfect for travel teams
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        Create a PartyTab for your team. Share the link in the parent
                        group chat. Anyone can add expenses (hotel, gas, snacks) from
                        their phone. After the tournament, everyone sees who owes who.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        Create a team expense tab →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Sample Tournament Weekend Expenses (5 families)
                </h2>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Expense</th>
                                <th className="text-right py-2">Total</th>
                                <th className="text-right py-2">Per Family</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Hotel (2 rooms, 2 nights)</td>
                                <td className="text-right py-2">$600</td>
                                <td className="text-right py-2">$120</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Gas (carpool, 2 cars)</td>
                                <td className="text-right py-2">$200</td>
                                <td className="text-right py-2">$40</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Team dinner (pizza party)</td>
                                <td className="text-right py-2">$150</td>
                                <td className="text-right py-2">$30</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Tournament snacks</td>
                                <td className="text-right py-2">$75</td>
                                <td className="text-right py-2">$15</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Coach hotel room</td>
                                <td className="text-right py-2">$150</td>
                                <td className="text-right py-2">$30</td>
                            </tr>
                            <tr className="font-semibold">
                                <td className="py-2">TOTAL SHARED</td>
                                <td className="text-right py-2">$1,175</td>
                                <td className="text-right py-2">$235</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Handling the Family That Never Pays
                </h2>
                <p>
                    Every travel team has one. Here&apos;s how to handle it:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Collect upfront:</strong> Require deposits before booking
                        hotels or travel.
                    </li>
                    <li>
                        <strong>Send clear invoices:</strong> Not vague texts—actual
                        itemized breakdowns.
                    </li>
                    <li>
                        <strong>Set payment deadlines:</strong> &quot;Please send by Friday&quot;
                        creates urgency.
                    </li>
                    <li>
                        <strong>Address it directly:</strong> If someone is consistently
                        late, the team manager should have a private conversation.
                    </li>
                </ul>
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Managing a travel team?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Track tournament expenses and split fairly across families.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start a Team Tab →
                    </Link>
                </div>
            </div>
        </article>
    );
}
