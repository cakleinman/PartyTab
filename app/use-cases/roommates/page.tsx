import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";
import { FaqSection } from "@/app/components/FaqSection";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo";

const FAQS = [
    {
        question: "How should roommates split rent when bedrooms are different sizes?",
        answer: "When rooms aren't equal, splitting rent 50/50 rarely feels fair. Common approaches are by square footage, by room desirability (private bath, natural light, closet space), or a simple agreed premium for the larger room. Decide the percentages together once, then record each person's share in PartyTab so it's the same every month with no re-litigating.",
    },
    {
        question: "How do you split utilities between roommates?",
        answer: "Most households split utilities evenly because usage is hard to meter per person. The friction is usually that one roommate's name is on the bill and they front it every month. Log each bill in PartyTab as it arrives so the person who paid is credited and everyone else's share is tracked — no more fronting hundreds of dollars and hoping to be paid back.",
    },
    {
        question: "What's the fairest way to handle shared groceries?",
        answer: "Separate truly shared staples (paper towels, dish soap, cooking oil) from personal food. Put shared items on the tab and split them; keep personal groceries off it. PartyTab lets you split a single Costco or grocery run between just the roommates who use those items, so nobody pays for someone else's snacks.",
    },
    {
        question: "How do you keep track of who paid which bill?",
        answer: "Use one ongoing tab for the apartment instead of a notes app or memory. Every time someone covers rent, a utility, or a shared run, they add it. The running ledger shows exactly who has paid what, and the settlement view shows who owes whom at any moment.",
    },
    {
        question: "What happens when a roommate moves out mid-month?",
        answer: "Settle the tab up to their move-out date. Because PartyTab tracks every expense individually rather than a single lump sum, you can split shared costs only across the dates and people involved, square up the departing roommate, and keep the tab running for everyone who stays.",
    },
];

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
        type: "website",
        images: OG_IMAGE,
    },
    twitter: {
        card: "summary_large_image",
        title: "Roommate Bill Splitting | PartyTab",
        description:
            "Split rent, utilities, and household expenses. Track who paid what easily.",
        images: TWITTER_IMAGE,
    },
    alternates: {
        canonical: "https://partytab.app/use-cases/roommates",
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
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Use Cases", url: "https://partytab.app/use-cases" },
                    { name: "Roommates", url: "https://partytab.app/use-cases/roommates" },
                ]}
            />
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

            {/* Deep dive */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-4">
                    How to Split Rent, Utilities, and Shared Bills
                </h2>
                <p className="text-ink-600 leading-relaxed mb-4">
                    Living together is cheaper than living alone&mdash;until the money gets fuzzy.
                    One roommate&apos;s name is on the electric bill, another always grabs the
                    paper towels, and rent is &ldquo;close enough&rdquo; to even. Three months in,
                    someone&apos;s keeping a running tally in their head and starting to feel taken
                    advantage of. That resentment, not the dollars, is what actually strains the
                    apartment.
                </p>
                <p className="text-ink-600 leading-relaxed mb-4">
                    A shared tab fixes it by making the math visible to everyone:
                </p>
                <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                        <span className="text-teal-600 mt-1">•</span>
                        <p className="text-ink-600">
                            <strong className="text-ink-900">Rent</strong> &mdash; set each
                            person&apos;s share once (evenly, by room size, or by an agreed
                            premium) and it stays consistent month to month.
                        </p>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-teal-600 mt-1">•</span>
                        <p className="text-ink-600">
                            <strong className="text-ink-900">Utilities</strong> &mdash; whoever&apos;s
                            name is on the bill logs it when it arrives and is credited for
                            fronting it, so they aren&apos;t out of pocket waiting to be repaid.
                        </p>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-teal-600 mt-1">•</span>
                        <p className="text-ink-600">
                            <strong className="text-ink-900">Shared supplies</strong> &mdash; split
                            household staples between the roommates who use them, and leave
                            personal groceries off the tab entirely.
                        </p>
                    </li>
                </ul>
                <h3 className="text-lg font-semibold text-ink-900 mb-3">A quick example</h3>
                <p className="text-ink-600 leading-relaxed mb-4">
                    Three roommates share a $2,100 apartment. The biggest bedroom takes a $100
                    premium, so shares are $800 / $700 / $600. Over the month, one covers the
                    $150 electric bill, another buys $90 of shared supplies, and the third pays
                    the $60 internet. Rather than reconciling four separate threads, PartyTab
                    rolls rent and every shared cost into one ledger and tells each roommate the
                    single amount to send at month&apos;s end.
                </p>
            </div>

            <FaqSection questions={FAQS} />

            {/* Bottom CTA */}
            <div className="text-center bg-ink-900 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-sand-50 mb-2">
                    Keep the peace in your apartment
                </h2>
                <p className="text-ink-500 mb-6">
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
                        href="/blog/splitting-rent-fairly"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Tips</span>
                        <p className="font-medium text-ink-900 mt-1">
                            How to Split Rent Fairly When Rooms Aren&apos;t Equal
                        </p>
                    </Link>
                    <Link
                        href="/blog/avoid-losing-friends-over-money"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Advice</span>
                        <p className="font-medium text-ink-900 mt-1">
                            How to Avoid Losing Friends Over Money
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
