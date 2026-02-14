import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Use Cases | PartyTab - Bill Splitting for Every Occasion",
    description:
        "See how PartyTab helps split expenses for bachelor parties, ski trips, roommates, group dinners, and more. No app download required.",
    keywords: [
        "bill splitting use cases",
        "group expense scenarios",
        "trip expense splitter",
        "party expense calculator",
    ],
    openGraph: {
        title: "PartyTab Use Cases - Bill Splitting for Every Occasion",
        description:
            "See how PartyTab helps split expenses for bachelor parties, ski trips, roommates, and more.",
        url: "https://partytab.app/use-cases",
    },
    alternates: {
        canonical: "https://partytab.app/use-cases",
    },
};

const useCases = [
    {
        slug: "bachelor-party",
        title: "Bachelor Party",
        emoji: "🎉",
        description: "Split the bar tab, Airbnb, activities, and more",
        keywords: ["bachelor party expenses", "stag party budget"],
    },
    {
        slug: "ski-trips",
        title: "Ski Trips",
        emoji: "⛷️",
        description: "Track lift tickets, cabin rentals, and après-ski dinners",
        keywords: ["ski trip cost calculator", "winter trip expenses"],
    },
    {
        slug: "roommates",
        title: "Roommates",
        emoji: "🏠",
        description: "Split rent, utilities, groceries, and household expenses",
        keywords: ["roommate bill splitting", "shared apartment costs"],
    },
    {
        slug: "group-dinners",
        title: "Group Dinners",
        emoji: "🍕",
        description: "Fair splitting when everyone orders differently",
        keywords: ["restaurant bill splitter", "dinner expense calculator"],
    },
    {
        slug: "college-roommates",
        title: "College Roommates",
        emoji: "🎓",
        description: "Split rent, utilities, and cleaning check fines in college apartments",
        keywords: ["college roommate expenses", "BYU roommate bills"],
    },
];

export default function UseCasesPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Hero */}
            <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
                    Split Expenses for <span className="text-teal-600">Any Occasion</span>
                </h1>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                    Whether it&apos;s a weekend getaway, monthly bills, or a night out—
                    PartyTab makes it easy to track who paid what and settle up fairly.
                    <strong className="text-ink-900"> No app download required.</strong>
                </p>
            </div>

            {/* Use Case Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-16">
                {useCases.map((useCase) => (
                    <Link
                        key={useCase.slug}
                        href={`/use-cases/${useCase.slug}`}
                        className="group block p-6 rounded-2xl border border-sand-200 bg-white hover:border-teal-200 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <span className="text-4xl">{useCase.emoji}</span>
                            <div>
                                <h2 className="text-xl font-bold text-ink-900 group-hover:text-teal-600 transition-colors">
                                    {useCase.title}
                                </h2>
                                <p className="text-ink-600 mt-1">{useCase.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Why PartyTab Section */}
            <div className="bg-sand-50 rounded-3xl p-8 mb-16">
                <h2 className="text-2xl font-bold text-ink-900 mb-6 text-center">
                    Why Choose PartyTab?
                </h2>
                <div className="grid sm:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">🌐</span>
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-1">No App Download</h3>
                        <p className="text-sm text-ink-600">
                            Works in your browser. Share a link—that&apos;s it.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-1">Instant Setup</h3>
                        <p className="text-sm text-ink-600">
                            Create a tab in seconds. No account required to start.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">🧮</span>
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-1">Smart Settlements</h3>
                        <p className="text-sm text-ink-600">
                            We calculate the simplest way to settle up.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="text-center">
                <Link
                    href="/tabs/new"
                    className="inline-block bg-ink-900 text-sand-50 px-8 py-4 rounded-xl font-semibold hover:bg-ink-700 transition-colors"
                >
                    Start a PartyTab →
                </Link>
                <p className="text-sm text-ink-500 mt-3">Free to use. No credit card required.</p>
            </div>
        </div>
    );
}
