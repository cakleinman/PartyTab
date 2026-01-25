import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Roommate Bill Splitting App | PartyTab",
    description:
        "Split rent, utilities, groceries, and household expenses with roommates. Track who paid what and keep everyone honest. No app download required.",
    keywords: [
        "roommate bill splitting app",
        "split rent with roommates",
        "shared apartment expenses",
        "roommate expense tracker",
        "split utilities calculator",
    ],
    openGraph: {
        title: "Roommate Bill Splitting | PartyTab",
        description:
            "Split rent, utilities, and household expenses. Track who paid what easily.",
        url: "https://partytab.app/use-cases/roommates",
    },
};

const TYPICAL_EXPENSES = [
    { name: "Rent", range: "Split equally or by room size", emoji: "🏠" },
    { name: "Utilities", range: "Electric, gas, water, internet", emoji: "💡" },
    { name: "Groceries", range: "Shared food and supplies", emoji: "🛒" },
    { name: "Cleaning Supplies", range: "Paper towels, soap, etc.", emoji: "🧹" },
    { name: "Streaming Services", range: "Netflix, Spotify, etc.", emoji: "📺" },
    { name: "Household Items", range: "Furniture, kitchen tools", emoji: "🪑" },
];

export default function RoommatesPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/use-cases" className="hover:text-teal-600">Use Cases</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Roommates</span>
            </nav>

            {/* Hero */}
            <div className="text-center mb-12">
                <span className="text-6xl mb-4 block">🏠</span>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
                    Roommate <span className="text-teal-600">Bill Splitting</span>
                </h1>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                    Living with roommates shouldn&apos;t mean awkward conversations about
                    who owes what. PartyTab keeps a running tally so everyone stays
                    accountable.
                </p>
            </div>

            {/* Main CTA */}
            <div className="bg-gradient-to-br from-orange-50 to-sand-50 rounded-3xl p-8 mb-12 text-center border border-orange-100">
                <h2 className="text-2xl font-bold text-ink-900 mb-2">
                    Moving in with roommates?
                </h2>
                <p className="text-ink-600 mb-6">
                    Start a tab for your apartment. Log shared expenses as they happen.
                </p>
                <Link
                    href="/tabs/new?name=Apartment%20🏠"
                    className="inline-block bg-ink-900 text-sand-50 px-8 py-4 rounded-xl font-semibold hover:bg-ink-700 transition-colors"
                >
                    Start a Roommate Tab →
                </Link>
                <p className="text-sm text-ink-500 mt-3">
                    No app download. Share the link with your roommates.
                </p>
            </div>

            {/* How It Works */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    How Roommates Use PartyTab
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-orange-700">
                            1
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-2">Create a Tab</h3>
                        <p className="text-sm text-ink-600">
                            One tab for your apartment. Add all roommates.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-orange-700">
                            2
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-2">Log as You Go</h3>
                        <p className="text-sm text-ink-600">
                            Paid the electric bill? Bought toilet paper? Add it to the tab.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-orange-700">
                            3
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-2">Settle Monthly</h3>
                        <p className="text-sm text-ink-600">
                            At month&apos;s end, see who owes who and square up.
                        </p>
                    </div>
                </div>
            </div>

            {/* Typical Expenses */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Common Roommate Expenses
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
            </div>

            {/* Features */}
            <div className="bg-orange-50 rounded-3xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Why Roommates Love PartyTab
                </h2>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <span className="text-orange-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Ongoing balance tracking</strong>
                            <p className="text-sm text-ink-600">
                                See at a glance who&apos;s ahead and who&apos;s behind on shared expenses.
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-orange-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Flexible splitting</strong>
                            <p className="text-sm text-ink-600">
                                Split some expenses 50/50, others by who uses them.
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-orange-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">No app required for roommates</strong>
                            <p className="text-sm text-ink-600">
                                They can view and add expenses via a browser link.
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-orange-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Payment reminders (Pro)</strong>
                            <p className="text-sm text-ink-600">
                                Nudge roommates when it&apos;s time to settle up.
                            </p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Bottom CTA */}
            <div className="text-center bg-ink-900 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-sand-50 mb-2">
                    Keep the peace in your apartment
                </h2>
                <p className="text-ink-300 mb-6">
                    Start a tab for your household today.
                </p>
                <Link
                    href="/tabs/new?name=Apartment%20🏠"
                    className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                >
                    Start a Roommate Tab
                </Link>
            </div>

            {/* Related */}
            <div className="mt-12 pt-8 border-t border-sand-200">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Other Use Cases</h3>
                <div className="flex flex-wrap gap-3">
                    <Link href="/use-cases/bachelor-party" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🎉 Bachelor Parties
                    </Link>
                    <Link href="/use-cases/ski-trips" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        ⛷️ Ski Trips
                    </Link>
                    <Link href="/use-cases/group-dinners" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🍕 Group Dinners
                    </Link>
                </div>
            </div>
        </div>
    );
}
