import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
    title: "College Roommate Expense Splitter | BYU & UVU Students | PartyTab",
    description:
        "Split rent, utilities, groceries, and cleaning check fines with college roommates. Built for 4-6 person apartments. No app download.",
    keywords: [
        "college roommate expense splitter",
        "BYU roommate bills",
        "UVU roommate expenses",
        "split rent college apartment",
        "Provo roommate bill splitting",
        "college apartment expense tracker",
    ],
    openGraph: {
        title: "College Roommate Expense Splitter | PartyTab",
        description:
            "Split rent, utilities, and cleaning check fines with college roommates. Built for Provo/Orem student housing.",
        url: "https://partytab.app/use-cases/college-roommates",
        type: "website",
        images: OG_IMAGE,
    },
    twitter: {
        card: "summary_large_image",
        title: "College Roommate Expense Splitter | PartyTab",
        description:
            "Split rent, utilities, and cleaning check fines with college roommates. Built for Provo/Orem student housing.",
        images: TWITTER_IMAGE,
    },
    alternates: {
        canonical: "https://partytab.app/use-cases/college-roommates",
    },
};

const TYPICAL_EXPENSES = [
    { name: "Rent", range: "$450-950/person/month", emoji: "🏠" },
    { name: "Utilities", range: "$15-40/person/month", emoji: "💡" },
    { name: "Internet", range: "$10-15/person/month", emoji: "📶" },
    { name: "Groceries", range: "WinCo & Smith's runs", emoji: "🛒" },
    { name: "Cleaning Checks", range: "$25-50 fines per fail", emoji: "🧹" },
    { name: "Household Supplies", range: "TP, soap, trash bags", emoji: "🧴" },
];

export default function CollegeRoommatesPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Use Cases", url: "https://partytab.app/use-cases" },
                    { name: "College Roommates", url: "https://partytab.app/use-cases/college-roommates" },
                ]}
            />
            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/use-cases" className="hover:text-teal-600">Use Cases</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">College Roommates</span>
            </nav>

            {/* Hero */}
            <div className="text-center mb-12">
                <span className="text-6xl mb-4 block">🎓</span>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
                    College Roommate <span className="text-teal-600">Bill Splitting</span>
                </h1>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                    Living with 4-6 roommates on a semester lease? Between rent, utilities,
                    grocery runs, and cleaning check fines, keeping track of who owes what
                    gets messy fast. PartyTab keeps a running tally so nobody gets burned.
                </p>
            </div>

            {/* Main CTA */}
            <div className="bg-gradient-to-br from-purple-50 to-sand-50 rounded-3xl p-8 mb-12 text-center border border-purple-100">
                <h2 className="text-2xl font-bold text-ink-900 mb-2">
                    Moving into a college apartment?
                </h2>
                <p className="text-ink-600 mb-6">
                    Start a tab for your apartment. Add all your roommates with a link—no app download needed.
                </p>
                <Link
                    href="/tabs/new?name=Apartment%20🎓"
                    className="inline-block bg-ink-900 text-sand-50 px-8 py-4 rounded-xl font-semibold hover:bg-ink-700 transition-colors"
                >
                    Start a College Apartment Tab →
                </Link>
                <p className="text-sm text-ink-500 mt-3">
                    Free to use. Works in your phone&apos;s browser.
                </p>
            </div>

            {/* Why College Is Different */}
            <div className="mb-12 bg-white rounded-2xl p-8 border border-sand-200">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Why College Apartments Are Different
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-ink-900 mb-3">
                            More roommates, more chaos
                        </h3>
                        <p className="text-sm text-ink-600">
                            Most college apartments in Provo and Orem have 4-6 people, often
                            in shared rooms. That&apos;s a lot of Venmo requests flying around
                            for rent, utilities, and the weekly WinCo run.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-ink-900 mb-3">
                            Semester leases mean turnover
                        </h3>
                        <p className="text-sm text-ink-600">
                            Roommates change every semester. Someone sells their contract
                            mid-term, someone new moves in. You need a system that&apos;s easy
                            to set up from scratch, not one that requires everyone to create
                            accounts.
                        </p>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    How College Roommates Use PartyTab
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-purple-700">
                            1
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-2">Create a Tab</h3>
                        <p className="text-sm text-ink-600">
                            One tab for the apartment. Text the link to your roommate group
                            chat—everyone joins in seconds.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-purple-700">
                            2
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-2">Log Everything</h3>
                        <p className="text-sm text-ink-600">
                            Paid the Rocky Mountain Power bill? Bought groceries at WinCo?
                            Failed the cleaning check? Add it to the tab.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-purple-700">
                            3
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-2">Settle Monthly</h3>
                        <p className="text-sm text-ink-600">
                            At the end of each month, PartyTab calculates who owes who with
                            the fewest payments possible.
                        </p>
                    </div>
                </div>
            </div>

            {/* Typical Expenses */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Common College Apartment Expenses
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
                    Provo/Orem prices as of 2026. Your mileage may vary.
                </p>
            </div>

            {/* College-Specific Scenarios */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Scenarios Only College Roommates Understand
                </h2>
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <h3 className="font-semibold text-ink-900 mb-2">🧹 Cleaning Checks</h3>
                        <p className="text-sm text-ink-600">
                            BYU-area housing inspects apartments regularly. Fail and the whole
                            apartment gets fined $25-50. But usually it&apos;s one person&apos;s
                            mess. Log the fine, split it among the responsible roommates (or
                            evenly if everyone slacked off), and move on.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <h3 className="font-semibold text-ink-900 mb-2">📋 Selling Your Contract</h3>
                        <p className="text-sm text-ink-600">
                            Moving out mid-semester? Settle up the tab before you hand off your
                            contract. PartyTab shows exactly what you owe (or what you&apos;re
                            owed) so there&apos;s no lingering debt when the new roommate moves in.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <h3 className="font-semibold text-ink-900 mb-2">🛒 The Group Grocery Run</h3>
                        <p className="text-sm text-ink-600">
                            One person drives to WinCo or Smith&apos;s and buys for the apartment.
                            Log the total on PartyTab. With Pro, snap a photo of the receipt and
                            let each roommate claim their own items.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <h3 className="font-semibold text-ink-900 mb-2">📝 Shared Subscriptions</h3>
                        <p className="text-sm text-ink-600">
                            One person pays for the apartment WiFi, another covers the streaming
                            password. Log recurring expenses once and keep a running balance all
                            semester.
                        </p>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="bg-purple-50 rounded-3xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Why College Students Love PartyTab
                </h2>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <span className="text-purple-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">No app to download</strong>
                            <p className="text-sm text-ink-600">
                                Your roommate who &ldquo;doesn&apos;t download apps&rdquo; can still
                                use it. Just share a browser link.
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-purple-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Works with 4-6+ people</strong>
                            <p className="text-sm text-ink-600">
                                Most expense apps feel clunky past 3 people. PartyTab handles
                                large apartments easily and minimizes the number of payments at
                                settlement.
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-purple-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Flexible splitting</strong>
                            <p className="text-sm text-ink-600">
                                Split utilities evenly, but only charge the roommates who ate
                                the groceries. Each expense can be split differently.
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-purple-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Receipt scanning (Pro)</strong>
                            <p className="text-sm text-ink-600">
                                Snap the WinCo receipt, and each roommate claims their items.
                                No more arguing about who ate the Oreos.
                            </p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Bottom CTA */}
            <div className="text-center bg-ink-900 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-sand-50 mb-2">
                    Keep your apartment drama-free
                </h2>
                <p className="text-ink-300 mb-6">
                    Start a tab for your college apartment. Settle up before finals.
                </p>
                <Link
                    href="/tabs/new?name=Apartment%20🎓"
                    className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                >
                    Start a College Apartment Tab
                </Link>
            </div>

            {/* Related */}
            <div className="mt-12 pt-8 border-t border-sand-200">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Other Use Cases</h3>
                <div className="flex flex-wrap gap-3">
                    <Link href="/use-cases/roommates" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🏠 Roommates
                    </Link>
                    <Link href="/use-cases/ski-trips" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        ⛷️ Ski Trips
                    </Link>
                    <Link href="/use-cases/group-dinners" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🍕 Group Dinners
                    </Link>
                    <Link href="/use-cases/bachelor-party" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🎉 Bachelor Parties
                    </Link>
                </div>
            </div>

            {/* Related Blog Posts */}
            <div className="mt-8 pt-8 border-t border-sand-200">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/blog/college-roommate-expenses-provo-utah"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Guide</span>
                        <p className="font-medium text-ink-900 mt-1">
                            The BYU & UVU Student&apos;s Guide to Splitting Roommate Expenses
                        </p>
                    </Link>
                    <Link
                        href="/blog/splitting-groceries-with-roommates"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Guide</span>
                        <p className="font-medium text-ink-900 mt-1">
                            Splitting Grocery Bills with Roommates
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
