import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";
import { FaqSection } from "@/app/components/FaqSection";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo";

const FAQS = [
    {
        question: "How do you split the cost of a ski cabin rental?",
        answer: "Lodging is the one ski-trip cost that's almost always split evenly, since everyone uses the cabin equally. The fair tweaks are for sleeping arrangements — a private master might carry a small premium while someone on the pull-out couch pays a bit less. Set those shares once in PartyTab and the nightly rate divides automatically.",
    },
    {
        question: "Should lift tickets be split evenly?",
        answer: "No — lift tickets should be paid per person, because skiers buy different numbers of days and some of the group may not ski at all. Log each person's tickets individually rather than rolling them into a group pot, so the friend who skied one day isn't paying for someone else's three-day pass.",
    },
    {
        question: "How do you handle people who rent gear versus bring their own?",
        answer: "Charge rentals only to the people who rent. Gear is a personal cost, not a group one. In PartyTab you add the rental as an expense split among just those renters, so owners who brought their own skis don't subsidize anyone's rental package.",
    },
    {
        question: "How do you split gas and driving costs for a ski trip?",
        answer: "Split fuel among the people in each car, not the whole group, and consider having passengers chip in to the driver for wear and tear. Add the gas as an expense covering only that vehicle's riders, and PartyTab folds it into the final settlement alongside lodging and food.",
    },
    {
        question: "Do beginners who only ski one day pay the same as everyone else?",
        answer: "They shouldn't pay the same for skiing, but they still share the lodging and group meals. Split the cabin and shared food evenly, then bill lift tickets, lessons, and rentals per person. That way a beginner who skis a single day pays their fair share of the stay without covering everyone's full mountain costs.",
    },
];

export const metadata: Metadata = {
    title: "Ski Trip Expense Splitter & Cost Calculator | PartyTab",
    description:
        "Split ski trip costs fairly—cabin rentals, lift tickets, gear rentals, and après-ski dinners. Calculate who owes what with PartyTab. No app download required.",
    keywords: [
        "ski trip expense splitter",
        "ski trip cost calculator",
        "winter vacation expense tracker",
        "split cabin rental costs",
        "group ski trip budget",
    ],
    openGraph: {
        title: "Ski Trip Expense Splitter | PartyTab",
        description:
            "Split ski trip costs fairly—cabin rentals, lift tickets, and more. No app download required.",
        url: "https://partytab.app/use-cases/ski-trips",
        type: "website",
        images: OG_IMAGE,
    },
    twitter: {
        card: "summary_large_image",
        title: "Ski Trip Expense Splitter | PartyTab",
        description:
            "Split ski trip costs fairly—cabin rentals, lift tickets, and more. No app download required.",
        images: TWITTER_IMAGE,
    },
    alternates: {
        canonical: "https://partytab.app/use-cases/ski-trips",
    },
};

const TYPICAL_EXPENSES = [
    { name: "Cabin / Lodging", range: "$80-200/night/person", emoji: "🏔️" },
    { name: "Lift Tickets", range: "$100-200/day", emoji: "🎿" },
    { name: "Gear Rental", range: "$40-80/day", emoji: "🎿" },
    { name: "Groceries", range: "$30-60/person", emoji: "🛒" },
    { name: "Gas / Transportation", range: "$20-50/person", emoji: "⛽" },
    { name: "Après-Ski Drinks", range: "$30-80/person", emoji: "🍺" },
];

export default function SkiTripsPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Use Cases", url: "https://partytab.app/use-cases" },
                    { name: "Ski Trips", url: "https://partytab.app/use-cases/ski-trips" },
                ]}
            />
            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/use-cases" className="hover:text-teal-600">Use Cases</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Ski Trips</span>
            </nav>

            {/* Hero */}
            <div className="text-center mb-12">
                <span className="text-6xl mb-4 block">⛷️</span>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
                    Ski Trip <span className="text-teal-600">Cost Calculator</span>
                </h1>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                    Between lift tickets, cabin splits, and après-ski rounds—ski trips get
                    expensive fast. PartyTab keeps track of who paid what so you can focus
                    on the slopes.
                </p>
            </div>

            {/* Main CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-sand-50 rounded-3xl p-8 mb-12 text-center border border-blue-100">
                <h2 className="text-2xl font-bold text-ink-900 mb-2">
                    Planning a ski trip?
                </h2>
                <p className="text-ink-600 mb-6">
                    Create a tab before you hit the slopes. Everyone logs expenses as you go.
                </p>
                <Link
                    href="/tabs/new?name=Ski%20Trip%20⛷️"
                    className="inline-block bg-ink-900 text-sand-50 px-8 py-4 rounded-xl font-semibold hover:bg-ink-700 transition-colors"
                >
                    Start a Ski Trip Tab →
                </Link>
                <p className="text-sm text-ink-500 mt-3">
                    Works in browser. No app download needed.
                </p>
            </div>

            {/* How It Works */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    How to Split Ski Trip Costs
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-blue-700">
                            1
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-2">Before the Trip</h3>
                        <p className="text-sm text-ink-600">
                            Whoever books the cabin or buys group lift tickets logs it immediately.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-blue-700">
                            2
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-2">During the Trip</h3>
                        <p className="text-sm text-ink-600">
                            Groceries, gas, dinner out—add expenses in real-time from your phone.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-sand-200">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-blue-700">
                            3
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-2">After the Trip</h3>
                        <p className="text-sm text-ink-600">
                            View the settlement—who owes who and exactly how much.
                        </p>
                    </div>
                </div>
            </div>

            {/* Typical Expenses */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Typical Ski Trip Expenses
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
                    A 3-day ski trip typically runs $400-800 per person
                </p>
            </div>

            {/* Ski-Specific Features */}
            <div className="bg-blue-50 rounded-3xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Perfect for Ski Trips Because...
                </h2>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <span className="text-blue-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Split by who participates</strong>
                            <p className="text-sm text-ink-600">
                                Not everyone skiing every day? Only split lift tickets among those who went.
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-blue-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Works offline-ish</strong>
                            <p className="text-sm text-ink-600">
                                Log expenses when you have signal, sync when you&apos;re back at the cabin.
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-blue-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Handle the big pre-payments</strong>
                            <p className="text-sm text-ink-600">
                                Someone puts $2,000 on their card for the cabin? It all gets balanced out.
                            </p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Deep dive */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-4">
                    How to Split Ski Trip Costs Fairly
                </h2>
                <p className="text-ink-600 leading-relaxed mb-4">
                    Ski trips are deceptively hard to settle because the costs split in opposite
                    directions. The cabin is shared equally, but everything on the mountain is
                    personal: one friend skis all three days on a season pass, another buys a
                    single day ticket, a third never leaves the lodge, and two need full gear
                    rentals. Split it all evenly and the lodge-sitter ends up funding everyone
                    else&apos;s lift tickets.
                </p>
                <p className="text-ink-600 leading-relaxed mb-4">
                    The fair approach is to sort costs into two buckets:
                </p>
                <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                        <span className="text-teal-600 mt-1">•</span>
                        <p className="text-ink-600">
                            <strong className="text-ink-900">Split evenly:</strong> the cabin or
                            condo, groceries, and any group dinners&mdash;costs everyone shares
                            regardless of skill.
                        </p>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-teal-600 mt-1">•</span>
                        <p className="text-ink-600">
                            <strong className="text-ink-900">Charge per person:</strong> lift
                            tickets, rentals, lessons, and gas&mdash;split among only the people
                            who used each one.
                        </p>
                    </li>
                </ul>
                <h3 className="text-lg font-semibold text-ink-900 mb-3">A quick example</h3>
                <p className="text-ink-600 leading-relaxed mb-4">
                    Four friends rent a $600 cabin for the weekend ($150 each). Two buy $220
                    two-day lift tickets, one buys a $120 single day, and one skips skiing
                    entirely. Two of them add $90 gear rentals. Groceries run $160 split four
                    ways. PartyTab keeps lodging and food even while billing tickets and rentals
                    to the right people&mdash;then nets the whole weekend into a couple of
                    transfers instead of a spreadsheet on the drive home.
                </p>
            </div>

            <FaqSection questions={FAQS} />

            {/* Bottom CTA */}
            <div className="text-center bg-ink-900 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-sand-50 mb-2">
                    Hit the slopes, not the calculator
                </h2>
                <p className="text-ink-300 mb-6">
                    Create a tab and share the link with your ski crew.
                </p>
                <Link
                    href="/tabs/new?name=Ski%20Trip%20⛷️"
                    className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                >
                    Start a Ski Trip Tab
                </Link>
            </div>

            {/* Related */}
            <div className="mt-12 pt-8 border-t border-sand-200">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Other Use Cases</h3>
                <div className="flex flex-wrap gap-3">
                    <Link href="/use-cases/bachelor-party" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🎉 Bachelor Parties
                    </Link>
                    <Link href="/use-cases/roommates" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🏠 Roommates
                    </Link>
                    <Link href="/use-cases/group-dinners" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🍕 Group Dinners
                    </Link>
                    <Link href="/use-cases/college-roommates" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🎓 College Roommates
                    </Link>
                </div>
            </div>

            {/* Related Articles */}
            <div className="mt-8 pt-8 border-t border-sand-200">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/blog/ski-trip-budget-guide"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Guide</span>
                        <p className="font-medium text-ink-900 mt-1">
                            Ski Trip Budget: How to Split Costs With Your Crew
                        </p>
                    </Link>
                    <Link
                        href="/blog/girls-trip-budget-planning"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Guide</span>
                        <p className="font-medium text-ink-900 mt-1">
                            Girls Trip Budget Planning: Split Costs Without the Drama
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
