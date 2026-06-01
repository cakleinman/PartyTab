import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
    title: "About PartyTab | Free Bill Splitting, No App Required",
    description:
        "PartyTab is a free, browser-based bill splitting app built to settle group expenses without the awkwardness. Learn who's behind it, how it works, and what we stand for.",
    keywords: [
        "about partytab",
        "bill splitting app",
        "free expense splitter",
        "who made partytab",
    ],
    openGraph: {
        title: "About PartyTab",
        description:
            "A free, browser-based bill splitting app built to settle group expenses without the awkwardness.",
        url: "https://partytab.app/about",
        type: "website",
        images: OG_IMAGE,
    },
    twitter: {
        card: "summary_large_image",
        title: "About PartyTab",
        description:
            "A free, browser-based bill splitting app built to settle group expenses without the awkwardness.",
        images: TWITTER_IMAGE,
    },
    alternates: {
        canonical: "https://partytab.app/about",
    },
};

const VALUES = [
    {
        title: "Free, with no ads",
        body: "The core app — tabs, expenses, splits, and settlement — is free and ad-free. PartyTab Pro adds optional power features like receipt scanning, but you never need it to split a bill.",
    },
    {
        title: "No download, no account to join",
        body: "Anyone can join a tab from a shared link in their browser. No app store, no sign-up, no friend requests — the things that usually cause one person to drop out of the group split.",
    },
    {
        title: "Privacy by default",
        body: "We don't sell your data or run ad networks. Your expense data lives in our own database; uploaded receipt images are the only thing stored externally, and only to power Pro receipt scanning.",
    },
    {
        title: "Fair math, fewer payments",
        body: "Our settlement algorithm calculates the minimum number of transfers needed to square everyone up — so a weekend of mixed expenses becomes a couple of payments, not a dozen.",
    },
];

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "About", url: "https://partytab.app/about" },
                ]}
            />
            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">
                    Home
                </Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">About</span>
            </nav>

            {/* Hero */}
            <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
                    About <span className="text-teal-600">PartyTab</span>
                </h1>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                    PartyTab is a free, browser-based app for splitting group expenses —
                    built so settling up never gets in the way of the trip, the dinner, or
                    the friendship.
                </p>
            </div>

            {/* Why we built it */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-ink-900 mb-4">Why we built it</h2>
                <p className="text-ink-600 leading-relaxed mb-4">
                    Every group has the same moment: the trip ends, the dinner wraps, and
                    someone has to figure out who owes whom. One person fronted the Airbnb,
                    another grabbed three dinners, and a third covered the gas. The math is
                    annoying, the reminders are awkward, and money quietly strains
                    friendships more than anyone admits.
                </p>
                <p className="text-ink-600 leading-relaxed mb-4">
                    Most expense-splitting tools answer this with a full app that everyone
                    has to download, create an account on, and add each other as friends
                    before a single dinner gets logged. In practice, one or two people never
                    do it — and the whole system falls apart. We wanted the opposite: open a
                    tab, share a link, and let anyone add an expense from their browser in
                    seconds.
                </p>
            </div>

            {/* What we stand for */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">What we stand for</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                    {VALUES.map((v) => (
                        <div
                            key={v.title}
                            className="bg-white rounded-2xl p-6 border border-sand-200"
                        >
                            <h3 className="font-semibold text-ink-900 mb-2">{v.title}</h3>
                            <p className="text-sm text-ink-600 leading-relaxed">{v.body}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Who's behind it */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-ink-900 mb-4">Who&apos;s behind it</h2>
                <p className="text-ink-600 leading-relaxed mb-4">
                    PartyTab is an independent project, not a big company. It was built to
                    fix a problem its maker kept running into — being the person stuck doing
                    the end-of-trip math by hand — and it&apos;s improved continuously based on
                    how real groups use it. We write about what we learn on the{" "}
                    <Link href="/blog" className="text-teal-600 hover:text-teal-700">
                        blog
                    </Link>
                    . Have a suggestion or found a bug? We read everything sent through the{" "}
                    <Link href="/feedback" className="text-teal-600 hover:text-teal-700">
                        feedback form
                    </Link>
                    .
                </p>
            </div>

            {/* CTA */}
            <div className="text-center bg-ink-900 rounded-3xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-sand-50 mb-2">
                    Try it on your next group expense
                </h2>
                <p className="text-ink-300 mb-6">
                    Create a tab, share the link, and settle up in seconds.
                </p>
                <Link
                    href="/tabs/new"
                    className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                >
                    Start a Tab (No Download)
                </Link>
            </div>

            {/* Related */}
            <div className="pt-8 border-t border-sand-200">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Learn more</h3>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/how-it-works"
                        className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors"
                    >
                        How It Works
                    </Link>
                    <Link
                        href="/use-cases"
                        className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors"
                    >
                        Use Cases
                    </Link>
                    <Link
                        href="/compare/splitwise"
                        className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors"
                    >
                        PartyTab vs Splitwise
                    </Link>
                </div>
            </div>
        </div>
    );
}
