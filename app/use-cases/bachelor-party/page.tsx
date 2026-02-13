import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "Bachelor Party Expense Splitter | PartyTab",
    description:
        "Split bachelor party expenses easily—bar tabs, Airbnb, activities, transportation. Track who paid what and settle up without the drama. No app download required.",
    keywords: [
        "bachelor party expense splitter",
        "stag party budget calculator",
        "bachelor party cost sharing",
        "split bachelor party costs",
        "group trip expense tracker",
    ],
    openGraph: {
        title: "Bachelor Party Expense Splitter | PartyTab",
        description:
            "Split bachelor party expenses easily. Track who paid what and settle up without the drama.",
        url: "https://partytab.app/use-cases/bachelor-party",
    },
};

const TYPICAL_EXPENSES = [
    { name: "Airbnb / Hotel", range: "$100-300/person", emoji: "🏠" },
    { name: "Bar Tabs", range: "$50-200/person", emoji: "🍺" },
    { name: "Activities", range: "$50-150/person", emoji: "🎯" },
    { name: "Transportation", range: "$30-100/person", emoji: "🚗" },
    { name: "Food & Groceries", range: "$40-80/person", emoji: "🍕" },
    { name: "Gifts for Groom", range: "$20-50/person", emoji: "🎁" },
];

export default function BachelorPartyPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Use Cases", url: "https://partytab.app/use-cases" },
                    { name: "Bachelor Party", url: "https://partytab.app/use-cases/bachelor-party" },
                ]}
            />
            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">
                    Home
                </Link>
                <span className="mx-2">→</span>
                <Link href="/use-cases" className="hover:text-teal-600">
                    Use Cases
                </Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Bachelor Party</span>
            </nav>

            {/* Hero */}
            <div className="text-center mb-12">
                <span className="text-6xl mb-4 block">🎉</span>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
                    Bachelor Party <span className="text-teal-600">Expense Splitter</span>
                </h1>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                    The best man shouldn&apos;t have to chase everyone for money. PartyTab
                    tracks who paid for what so you can focus on celebrating—then settle
                    up with one simple calculation.
                </p>
            </div>

            {/* Main CTA */}
            <div className="bg-gradient-to-br from-teal-50 to-sand-50 rounded-3xl p-8 mb-12 text-center border border-teal-100">
                <h2 className="text-2xl font-bold text-ink-900 mb-2">
                    Planning a bachelor party?
                </h2>
                <p className="text-ink-600 mb-6">
                    Create a tab in 10 seconds. Share the link with the group. Everyone
                    adds expenses as they go.
                </p>
                <Link
                    href="/tabs/new?name=Bachelor%20Party%20🎉"
                    className="inline-block bg-ink-900 text-sand-50 px-8 py-4 rounded-xl font-semibold hover:bg-ink-700 transition-colors"
                >
                    Start a Bachelor Party Tab →
                </Link>
                <p className="text-sm text-ink-500 mt-3">
                    No app download. No account required to start.
                </p>
            </div>

            {/* How It Works */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    How PartyTab Works for Bachelor Parties
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-teal-700">
                            1
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-2">Create Your Tab</h3>
                        <p className="text-sm text-ink-600">
                            Name it, add the crew. Takes 30 seconds.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-teal-700">
                            2
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-2">Log Expenses</h3>
                        <p className="text-sm text-ink-600">
                            Anyone covers something? Add it to the tab with who it&apos;s split
                            between.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-teal-700">
                            3
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-2">Settle Up</h3>
                        <p className="text-sm text-ink-600">
                            We calculate who owes who—minimizing the number of payments needed.
                        </p>
                    </div>
                </div>
            </div>

            {/* Typical Expenses */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Typical Bachelor Party Expenses
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {TYPICAL_EXPENSES.map((expense) => (
                        <div
                            key={expense.name}
                            className="flex items-center gap-3 bg-white rounded-xl p-4 border border-sand-200"
                        >
                            <span className="text-2xl">{expense.emoji}</span>
                            <div>
                                <p className="font-medium text-ink-900">{expense.name}</p>
                                <p className="text-sm text-ink-500">{expense.range}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-ink-500 mt-4 text-center">
                    Average total: $300-900 per person depending on destination and
                    activities
                </p>
            </div>

            {/* Features */}
            <div className="bg-sand-50 rounded-3xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Why PartyTab for Bachelor Parties?
                </h2>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <span className="text-teal-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">No app download required</strong>
                            <p className="text-sm text-ink-600">
                                Everyone can access via browser link—no convincing the group to
                                install yet another app
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-teal-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Partial splits supported</strong>
                            <p className="text-sm text-ink-600">
                                Not everyone doing every activity? Split expenses between just
                                the people involved
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-teal-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">
                                Smart settlement calculation
                            </strong>
                            <p className="text-sm text-ink-600">
                                Instead of 15 different Venmo requests, get the minimum payments
                                needed
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-teal-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Receipt scanning (Pro)</strong>
                            <p className="text-sm text-ink-600">
                                Snap a photo of receipts to auto-populate expense details
                            </p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Bottom CTA */}
            <div className="text-center bg-ink-900 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-sand-50 mb-2">
                    Ready to plan the bachelor party?
                </h2>
                <p className="text-ink-300 mb-6">
                    Create a tab and send the link to the group chat.
                </p>
                <Link
                    href="/tabs/new?name=Bachelor%20Party%20🎉"
                    className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                >
                    Start a Bachelor Party Tab
                </Link>
            </div>

            {/* Related Use Cases */}
            <div className="mt-12 pt-8 border-t border-sand-200">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">
                    Other Use Cases
                </h3>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/use-cases/ski-trips"
                        className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors"
                    >
                        ⛷️ Ski Trips
                    </Link>
                    <Link
                        href="/use-cases/roommates"
                        className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors"
                    >
                        🏠 Roommates
                    </Link>
                    <Link
                        href="/use-cases/group-dinners"
                        className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors"
                    >
                        🍕 Group Dinners
                    </Link>
                </div>
            </div>
        </div>
    );
}
