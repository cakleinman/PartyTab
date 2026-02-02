import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "How PartyTab Works | Split Group Expenses Easily",
    description:
        "Learn how PartyTab makes splitting expenses simple. Create a tab, add expenses, and settle up—all in your browser. No app download required.",
    keywords: [
        "how partytab works",
        "expense splitting tutorial",
        "bill splitting guide",
        "how to split expenses",
    ],
    openGraph: {
        title: "How PartyTab Works - Easy Expense Splitting",
        description: "Create a tab, add expenses, settle up. It's that simple.",
        url: "https://partytab.app/how-it-works",
    },
};

const STEPS = [
    {
        number: 1,
        title: "Create a Tab",
        description: "Give your tab a name (like \"Ski Trip 2026\" or \"Apartment Expenses\") and add the people involved. Takes about 30 seconds.",
        emoji: "📝",
    },
    {
        number: 2,
        title: "Share the Link",
        description: "Copy the tab link and send it to your group via text, email, or any messaging app. They don't need to download anything.",
        emoji: "🔗",
    },
    {
        number: 3,
        title: "Log Expenses",
        description: "When someone pays for something, they add it to the tab—who paid, how much, and who it's split between.",
        emoji: "💰",
    },
    {
        number: 4,
        title: "See Who Owes What",
        description: "PartyTab calculates the simplest way to settle up, minimizing the number of payments needed.",
        emoji: "🧮",
    },
    {
        number: 5,
        title: "Settle Up",
        description: "Send payments via Venmo, Zelle, or cash. Mark them as settled in the app when done.",
        emoji: "✅",
    },
];

const FEATURES = [
    {
        title: "Partial Splits",
        description: "Not everyone doing every activity? Split expenses among just the people involved.",
        emoji: "✂️",
    },
    {
        title: "Receipt Scanning",
        description: "Snap a photo of a receipt and we'll extract the details automatically. (Pro)",
        emoji: "📸",
    },
    {
        title: "Smart Settlements",
        description: "Instead of 10 separate payments, we calculate the minimum transfers needed.",
        emoji: "🧠",
    },
    {
        title: "No Account Required",
        description: "Anyone can view and add expenses via the shared link—no sign-up needed to participate.",
        emoji: "🚀",
    },
    {
        title: "Works Everywhere",
        description: "Browser-based means it works on any device—iPhone, Android, laptop, tablet.",
        emoji: "🌐",
    },
    {
        title: "Payment Reminders",
        description: "Nudge friends who haven't settled up yet. (Pro)",
        emoji: "⏰",
    },
];

export default function HowItWorksPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">How It Works</span>
            </nav>

            {/* Hero */}
            <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
                    How <span className="text-teal-600">PartyTab</span> Works
                </h1>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                    Splitting expenses shouldn&apos;t be complicated. Here&apos;s how
                    PartyTab makes it simple—without downloading an app.
                </p>
            </div>

            {/* Steps */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold text-ink-900 mb-8 text-center">
                    5 Simple Steps
                </h2>
                <div className="space-y-6">
                    {STEPS.map((step) => (
                        <div
                            key={step.number}
                            className="flex gap-6 items-start bg-white rounded-2xl p-6 border border-sand-200"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-2xl">
                                    {step.emoji}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                                        STEP {step.number}
                                    </span>
                                    <h3 className="font-semibold text-ink-900 text-lg">{step.title}</h3>
                                </div>
                                <p className="text-ink-600">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Demo CTA */}
            <div className="bg-gradient-to-br from-teal-50 to-sand-50 rounded-3xl p-8 mb-16 text-center border border-teal-100">
                <h2 className="text-2xl font-bold text-ink-900 mb-2">
                    See it in action
                </h2>
                <p className="text-ink-600 mb-6">
                    Try the interactive demo on our homepage or create your own tab.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-block bg-white text-ink-900 px-6 py-3 rounded-xl font-semibold border border-sand-200 hover:border-sand-300 transition-colors"
                    >
                        See Demo →
                    </Link>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-ink-900 text-sand-50 px-6 py-3 rounded-xl font-semibold hover:bg-ink-700 transition-colors"
                    >
                        Create a Tab
                    </Link>
                </div>
            </div>

            {/* Features Grid */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold text-ink-900 mb-8 text-center">
                    Key Features
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feature) => (
                        <div
                            key={feature.title}
                            className="bg-white rounded-2xl p-6 border border-sand-200"
                        >
                            <div className="text-3xl mb-3">{feature.emoji}</div>
                            <h3 className="font-semibold text-ink-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-ink-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Common Questions
                </h2>
                <div className="space-y-6">
                    <div className="bg-sand-50 rounded-2xl p-6">
                        <h3 className="font-semibold text-ink-900 mb-2">
                            Do my friends need to create an account?
                        </h3>
                        <p className="text-ink-600">
                            No! Anyone with the link can view the tab and add expenses. Only
                            the tab creator needs an account to manage settings.
                        </p>
                    </div>
                    <div className="bg-sand-50 rounded-2xl p-6">
                        <h3 className="font-semibold text-ink-900 mb-2">
                            Does PartyTab handle the actual payments?
                        </h3>
                        <p className="text-ink-600">
                            PartyTab calculates who owes who, but you handle the payments
                            yourself via Venmo, Zelle, cash, or however you prefer. We don&apos;t
                            touch your money.
                        </p>
                    </div>
                    <div className="bg-sand-50 rounded-2xl p-6">
                        <h3 className="font-semibold text-ink-900 mb-2">
                            What happens after the trip ends?
                        </h3>
                        <p className="text-ink-600">
                            Your tab stays available so you can reference it later. Once
                            everyone settles up, you can archive or delete it.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center bg-ink-900 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-sand-50 mb-2">
                    Ready to try it?
                </h2>
                <p className="text-ink-300 mb-6">
                    Create your first tab in under a minute.
                </p>
                <Link
                    href="/tabs/new"
                    className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                >
                    Start a PartyTab →
                </Link>
                <p className="text-sm text-ink-400 mt-3">Free forever. No credit card required.</p>
            </div>
        </div>
    );
}
