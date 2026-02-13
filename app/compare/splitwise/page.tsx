import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "PartyTab vs Splitwise - Best Bill Splitting App Comparison 2026",
    description:
        "Compare PartyTab and Splitwise: features, pricing, and ease of use. Find out which expense splitting app is right for you. No app download required with PartyTab.",
    keywords: [
        "splitwise alternative",
        "partytab vs splitwise",
        "bill splitting app comparison",
        "apps like splitwise",
        "splitwise competitor",
        "best expense splitting app",
    ],
    alternates: {
        canonical: "https://partytab.app/compare/splitwise",
    },
    openGraph: {
        title: "PartyTab vs Splitwise - Which Bill Splitter is Best?",
        description:
            "Complete comparison of PartyTab and Splitwise. Features, pricing, and user experience.",
        url: "https://partytab.app/compare/splitwise",
    },
};

const COMPARISON_DATA = [
    {
        feature: "Works in browser",
        partytab: true,
        splitwise: false,
        note: "PartyTab works entirely in your web browser",
    },
    {
        feature: "No app download required",
        partytab: true,
        splitwise: false,
        note: "Share a link—friends don't need to install anything",
    },
    {
        feature: "Free to start (no account)",
        partytab: true,
        splitwise: false,
        note: "Create a tab instantly without signing up",
    },
    {
        feature: "Smart settlement calculation",
        partytab: true,
        splitwise: true,
        note: "Both apps minimize the number of payments needed",
    },
    {
        feature: "Partial expense splitting",
        partytab: true,
        splitwise: true,
        note: "Split expenses among only some group members",
    },
    {
        feature: "Receipt scanning",
        partytab: "Pro",
        splitwise: "Pro",
        note: "Available on paid tiers",
    },
    {
        feature: "Payment reminders",
        partytab: "Pro",
        splitwise: true,
        note: "Splitwise includes in free tier",
    },
    {
        feature: "Ad-free experience",
        partytab: true,
        splitwise: "Pro",
        note: "PartyTab is always ad-free",
    },
    {
        feature: "Native mobile app",
        partytab: false,
        splitwise: true,
        note: "Splitwise has dedicated iOS/Android apps",
    },
    {
        feature: "Integrations (Venmo, etc.)",
        partytab: false,
        splitwise: true,
        note: "Splitwise integrates with payment apps",
    },
];

function FeatureCell({ value }: { value: boolean | string }) {
    if (value === true) {
        return <span className="text-green-600 font-semibold">✓ Yes</span>;
    }
    if (value === false) {
        return <span className="text-ink-400">✗ No</span>;
    }
    return <span className="text-amber-600 font-medium">{value}</span>;
}

export default function CompareSplitwisePage() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">PartyTab vs Splitwise</span>
            </nav>

            {/* Hero */}
            <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
                    PartyTab vs <span className="text-teal-600">Splitwise</span>
                </h1>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                    Both apps help you split expenses with friends—but they work
                    differently. Here&apos;s an honest comparison to help you choose.
                </p>
            </div>

            {/* Quick Summary */}
            <div className="bg-gradient-to-br from-teal-50 to-sand-50 rounded-3xl p-8 mb-12 border border-teal-100">
                <h2 className="text-xl font-bold text-ink-900 mb-4">Quick Summary</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-teal-700 mb-2">Choose PartyTab if you:</h3>
                        <ul className="space-y-2 text-sm text-ink-700">
                            <li className="flex items-start gap-2">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                Want something that works instantly in a browser
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                Don&apos;t want to make friends download an app
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                Need a quick one-time trip or event tab
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-teal-600 mt-0.5">✓</span>
                                Want an ad-free experience without paying
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-ink-700 mb-2">Choose Splitwise if you:</h3>
                        <ul className="space-y-2 text-sm text-ink-700">
                            <li className="flex items-start gap-2">
                                <span className="text-ink-400 mt-0.5">•</span>
                                Want a dedicated native mobile app
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-ink-400 mt-0.5">•</span>
                                Need Venmo/PayPal integration
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-ink-400 mt-0.5">•</span>
                                Have ongoing expenses with the same group
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-ink-400 mt-0.5">•</span>
                                Your friends already use Splitwise
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Detailed Comparison Table */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Feature Comparison
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-sand-200">
                                <th className="text-left py-4 px-4 font-semibold text-ink-900">Feature</th>
                                <th className="text-center py-4 px-4 font-semibold text-teal-700 bg-teal-50/50">PartyTab</th>
                                <th className="text-center py-4 px-4 font-semibold text-ink-700">Splitwise</th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMPARISON_DATA.map((row, i) => (
                                <tr key={row.feature} className={i % 2 === 0 ? "bg-sand-50/50" : ""}>
                                    <td className="py-4 px-4">
                                        <div className="font-medium text-ink-900">{row.feature}</div>
                                        <div className="text-xs text-ink-500 mt-0.5">{row.note}</div>
                                    </td>
                                    <td className="text-center py-4 px-4 bg-teal-50/30">
                                        <FeatureCell value={row.partytab} />
                                    </td>
                                    <td className="text-center py-4 px-4">
                                        <FeatureCell value={row.splitwise} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PartyTab Advantages */}
            <div className="bg-teal-50 rounded-3xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Why People Switch to PartyTab
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6">
                        <div className="text-3xl mb-3">🌐</div>
                        <h3 className="font-semibold text-ink-900 mb-2">No App Download</h3>
                        <p className="text-sm text-ink-600">
                            The biggest friction with Splitwise is getting everyone to
                            download the app. With PartyTab, you just share a link. Done.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6">
                        <div className="text-3xl mb-3">⚡</div>
                        <h3 className="font-semibold text-ink-900 mb-2">Instant Start</h3>
                        <p className="text-sm text-ink-600">
                            Create a tab in 10 seconds without creating an account. Perfect
                            for one-off trips where you just need something quick.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6">
                        <div className="text-3xl mb-3">🚫</div>
                        <h3 className="font-semibold text-ink-900 mb-2">No Ads (Ever)</h3>
                        <p className="text-sm text-ink-600">
                            Splitwise shows ads on the free tier. PartyTab is completely
                            ad-free, even without paying.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6">
                        <div className="text-3xl mb-3">🔗</div>
                        <h3 className="font-semibold text-ink-900 mb-2">Link-Based Sharing</h3>
                        <p className="text-sm text-ink-600">
                            Share your tab via any messaging app. Friends can view and add
                            expenses without creating an account.
                        </p>
                    </div>
                </div>
            </div>

            {/* Splitwise Advantages (fair comparison) */}
            <div className="bg-sand-50 rounded-3xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Where Splitwise Wins
                </h2>
                <p className="text-ink-600 mb-4">
                    We believe in honest comparisons. Here&apos;s where Splitwise has advantages:
                </p>
                <ul className="space-y-3 text-ink-700">
                    <li className="flex items-start gap-3">
                        <span className="text-ink-400">•</span>
                        <div>
                            <strong>Native mobile apps</strong> – Dedicated iOS and Android
                            apps with push notifications
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-ink-400">•</span>
                        <div>
                            <strong>Payment integrations</strong> – Direct links to Venmo,
                            PayPal, and bank transfers
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-ink-400">•</span>
                        <div>
                            <strong>Larger user base</strong> – More likely your friends
                            already have it installed
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-ink-400">•</span>
                        <div>
                            <strong>Longer track record</strong> – Been around since 2011
                            with proven reliability
                        </div>
                    </li>
                </ul>
            </div>

            {/* CTA */}
            <div className="text-center bg-ink-900 rounded-3xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-sand-50 mb-2">
                    Try PartyTab Free
                </h2>
                <p className="text-ink-300 mb-6">
                    See for yourself why people love the simplicity.
                </p>
                <Link
                    href="/tabs/new"
                    className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                >
                    Start a Tab (No Download)
                </Link>
            </div>

            {/* FAQ */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-ink-900 mb-2">
                            Can I import my Splitwise data to PartyTab?
                        </h3>
                        <p className="text-ink-600">
                            Not currently, but we&apos;re considering this feature. For now,
                            PartyTab works best for new trips and expenses rather than
                            migrating existing data.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-ink-900 mb-2">
                            Is PartyTab really free?
                        </h3>
                        <p className="text-ink-600">
                            Yes! The core features are completely free with no ads. PartyTab
                            Pro adds receipt scanning and reminders for power users.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-ink-900 mb-2">
                            Why doesn&apos;t PartyTab have a mobile app?
                        </h3>
                        <p className="text-ink-600">
                            We built PartyTab as a web app specifically so you don&apos;t need
                            to download anything. It works great on mobile browsers and can be
                            added to your home screen.
                        </p>
                    </div>
                </div>
            </div>

            {/* Related */}
            <div className="pt-8 border-t border-sand-200">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Use Cases</h3>
                <div className="flex flex-wrap gap-3">
                    <Link href="/use-cases/bachelor-party" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🎉 Bachelor Parties
                    </Link>
                    <Link href="/use-cases/ski-trips" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        ⛷️ Ski Trips
                    </Link>
                    <Link href="/use-cases/roommates" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🏠 Roommates
                    </Link>
                    <Link href="/use-cases/group-dinners" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🍕 Group Dinners
                    </Link>
                </div>
            </div>
        </div>
    );
}
