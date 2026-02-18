import type { Metadata } from "next";
import Link from "next/link";

import { AuthorBio } from "@/app/components/AuthorBio";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
    title: "How to Split a Ski Day Trip from Provo (Without Losing Friends) | PartyTab",
    description:
        "Real drive times, lift ticket prices, and gas costs for skiing from Provo. Sundance, Brighton, Park City, and more—plus how to split the 4 expenses that cause arguments.",
    keywords: [
        "split ski trip costs Utah",
        "BYU ski trip expenses",
        "Provo skiing day trip",
        "split lift ticket costs",
        "Utah student ski trip budget",
        "Sundance ski day cost",
        "Brighton ski day from Provo",
    ],
    openGraph: {
        type: "article",
        title: "How to Split a Ski Day Trip from Provo (Without Losing Friends)",
        description:
            "Real drive times, lift tickets, and gas costs for skiing from Provo. Plus how to split the 4 expenses that cause arguments.",
        url: "https://partytab.app/blog/split-ski-trip-costs-utah-students",
        images: OG_IMAGE,
    },
    twitter: {
        card: "summary_large_image",
        title: "How to Split a Ski Day Trip from Provo (Without Losing Friends)",
        description:
            "Real drive times, lift tickets, and gas costs for skiing from Provo. Plus how to split the 4 expenses that cause arguments.",
        images: TWITTER_IMAGE,
    },
    alternates: {
        canonical: "https://partytab.app/blog/split-ski-trip-costs-utah-students",
    },
};

export default function SplitSkiTripCostsUtahPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="How to Split a Ski Day Trip from Provo (Without Losing Friends)"
                description="Real drive times, lift ticket prices, and gas costs for skiing from Provo. Plus how to split the 4 expenses that cause arguments."
                slug="split-ski-trip-costs-utah-students"
                datePublished="2026-03-12"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Split Ski Trip Costs Utah", url: "https://partytab.app/blog/split-ski-trip-costs-utah-students" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Split Ski Trip Costs Utah</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        TIPS
                    </span>
                    <span className="text-sm text-ink-400">March 12, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">6 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    How to Split a Ski Day Trip from Provo (Without Losing Friends)
                </h1>
                <p className="text-xl text-ink-600">
                    Gas, lift tickets, rentals, and the post-ski burrito run. Here&apos;s
                    how to handle the money so everyone actually wants to go again.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    One of the best perks of going to school in Provo: you&apos;re 20
                    minutes from Sundance, an hour from Brighton, and 75 minutes from
                    Park City. A ski day trip is one of the easiest weekend plans you can
                    make.
                </p>
                <p>
                    It&apos;s also one of the easiest plans to turn sour when money gets
                    weird. Someone has a season pass while everyone else is paying $80+
                    for day passes. The driver spent $40 on gas. One person rented gear
                    and another brought their own. And then there&apos;s the post-ski
                    Betos run where someone orders for the whole car.
                </p>
                <p>
                    Here&apos;s how to split it all fairly.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Where You&apos;re Going (and What It Costs)
                </h2>
                <p>
                    Here are the most popular options from Provo, with real 2025-26 season
                    prices:
                </p>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6">
                    <h4 className="font-semibold text-ink-900 mb-4">Day Trip Options from Provo</h4>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Resort</th>
                                <th className="text-right py-2">Drive</th>
                                <th className="text-right py-2">Day Pass</th>
                                <th className="text-right py-2">Pass Network</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 font-medium">Sundance</td>
                                <td className="text-right py-2">20 min</td>
                                <td className="text-right py-2">$79-109</td>
                                <td className="text-right py-2">Ikon</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 font-medium">Brighton</td>
                                <td className="text-right py-2">60 min</td>
                                <td className="text-right py-2">$85-115</td>
                                <td className="text-right py-2">Ikon</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 font-medium">Solitude</td>
                                <td className="text-right py-2">55 min</td>
                                <td className="text-right py-2">$90-130</td>
                                <td className="text-right py-2">Ikon</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 font-medium">Snowbird</td>
                                <td className="text-right py-2">50 min</td>
                                <td className="text-right py-2">$100-150</td>
                                <td className="text-right py-2">Ikon</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 font-medium">Park City</td>
                                <td className="text-right py-2">75 min</td>
                                <td className="text-right py-2">$120-180</td>
                                <td className="text-right py-2">Epic</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-medium">Deer Valley</td>
                                <td className="text-right py-2">75 min</td>
                                <td className="text-right py-2">$150-250</td>
                                <td className="text-right py-2">Ikon</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    Most BYU/UVU students gravitate toward Sundance (it&apos;s closest
                    and cheapest) or Brighton (bigger mountain, worth the drive). Park
                    City is the splurge option—usually reserved for when parents are in
                    town.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The 4 Expenses That Cause Arguments
                </h2>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    1. Gas Money
                </h3>
                <p>
                    Sundance is about 25 miles round trip from Provo—barely $5 in gas.
                    Brighton is about 110 miles round trip—closer to $15-20. Park City
                    is 140 miles round trip—$20-25 depending on your car.
                </p>
                <p>
                    The fair split: total gas cost divided by everyone in the car,
                    including the driver. The driver isn&apos;t doing you a favor by
                    paying for gas—they&apos;re doing you a favor by driving. Factor in
                    wear and tear if you want to be generous: add $5-10 for the driver
                    on longer trips.
                </p>

                <div className="bg-sand-50 rounded-2xl p-6 my-6">
                    <h4 className="font-semibold text-ink-900 mb-3">Gas Math Example: Brighton Day Trip</h4>
                    <p className="text-sm text-ink-700">
                        110 miles round trip × $0.15/mile (avg sedan) = ~$16.50 in gas<br />
                        4 people in the car = <strong>~$4.13 per person</strong><br />
                        Add $5 driver tip = <strong>$5.38 per passenger, driver pays $0</strong>
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    2. Season Pass vs. Day Pass
                </h3>
                <p>
                    This is the big one. If two people in your car have Ikon passes and
                    two don&apos;t, the day-pass people are paying $85-150 while the pass
                    holders paid $0 (well, they already paid $600+ for the season).
                </p>
                <p>
                    <strong>The rule:</strong> don&apos;t split lift tickets. Each person
                    pays for their own access to the mountain. A season pass is a personal
                    investment—the holder shouldn&apos;t subsidize day passes, and
                    day-pass buyers shouldn&apos;t subsidize the pass.
                </p>
                <p>
                    Log each person&apos;s lift ticket as their own expense on PartyTab
                    (or don&apos;t log it at all if everyone pays individually). The only
                    exception: if someone buys a group discount pack or a buddy pass, log
                    that shared purchase and split it among the beneficiaries.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    3. Gear Rentals
                </h3>
                <p>
                    Rental shops in Provo (like Utah Ski Gear or Christy Sports near
                    University Pkwy) charge $30-50/day for a ski or snowboard package.
                    On-mountain rentals are $50-80+.
                </p>
                <p>
                    Like lift tickets, rentals are personal. Don&apos;t split them across
                    the group. The person who owns their own gear shouldn&apos;t subsidize
                    rentals for someone who doesn&apos;t.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">Pro tip for students</p>
                    <p className="text-amber-700 text-sm">
                        Rent from a shop in Provo the night before—it&apos;s cheaper than
                        on-mountain rental and you skip the morning line. Most shops near
                        BYU offer student discounts with a valid ID.
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    4. Food (The Betos/Rancherito&apos;s Stop)
                </h3>
                <p>
                    The unwritten rule of skiing from Provo: you stop for burritos on the
                    way home. Whether it&apos;s Betos, Rancherito&apos;s, or the Taco Bell
                    on University Ave, someone inevitably orders for the whole car at the
                    drive-through.
                </p>
                <p>
                    This is where expense splitting actually matters. If one person puts
                    the whole order on their card, log it on PartyTab and split among
                    everyone who ate. Simple.
                </p>
                <p>
                    On-mountain food is pricier ($12-18 for a burger and fries), and
                    usually everyone pays individually. But if someone grabs a round of
                    hot chocolates in the lodge, that&apos;s a shared expense worth logging.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    What a Real Ski Day Costs (Per Person)
                </h2>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6">
                    <h4 className="font-semibold text-ink-900 mb-4">Sundance Day Trip Budget</h4>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Expense</th>
                                <th className="text-right py-2">With Pass</th>
                                <th className="text-right py-2">Without Pass</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Gas (split 4 ways)</td>
                                <td className="text-right py-2">$3</td>
                                <td className="text-right py-2">$3</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Lift ticket</td>
                                <td className="text-right py-2">$0</td>
                                <td className="text-right py-2">$89</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Gear rental</td>
                                <td className="text-right py-2">$0</td>
                                <td className="text-right py-2">$40</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Lunch on mountain</td>
                                <td className="text-right py-2">$15</td>
                                <td className="text-right py-2">$15</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Post-ski burrito</td>
                                <td className="text-right py-2">$8</td>
                                <td className="text-right py-2">$8</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-semibold">Total</td>
                                <td className="text-right py-2 font-semibold">$26</td>
                                <td className="text-right py-2 font-semibold">$155</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    That gap between $26 and $155 is exactly why you don&apos;t split
                    everything evenly. Split the shared stuff (gas, food someone buys for
                    the group). Keep personal costs personal (lift tickets, rentals).
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    How to Track It Without Being That Person
                </h2>
                <p>
                    Nobody wants to be the one pulling out a calculator in the parking lot
                    at Sundance. Here&apos;s the low-friction approach:
                </p>
                <ol className="list-decimal pl-6 space-y-3">
                    <li>
                        <strong>Create a PartyTab before you leave.</strong> Takes 10
                        seconds. Text the link to the group chat.
                    </li>
                    <li>
                        <strong>Log shared expenses as they happen.</strong> Someone fills
                        up gas? 15 seconds to log it. Someone orders food for the car? Log
                        it.
                    </li>
                    <li>
                        <strong>Don&apos;t log personal expenses.</strong> Your lift
                        ticket and gear rental are your problem. Only log things that
                        involve other people&apos;s money.
                    </li>
                    <li>
                        <strong>Settle up on the drive home.</strong> Check the tab, Venmo
                        whoever is owed, done before you get back to Provo.
                    </li>
                </ol>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        Track ski day expenses with PartyTab
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        Create a tab, share the link, log shared expenses as they happen.
                        Settle up on the drive home. No app download needed.
                    </p>
                    <Link
                        href="/use-cases/ski-trips"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        See how it works for ski trips →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Planning a Multi-Day Trip?
                </h2>
                <p>
                    If your group is doing an overnight in Park City or a weekend cabin in
                    Heber, the expenses get bigger: lodging, multiple days of food,
                    maybe hot tub snacks. The same principles apply—split shared costs,
                    keep personal costs personal—but with more transactions to track.
                </p>
                <p>
                    Check out our{" "}
                    <Link href="/blog/ski-trip-budget-guide" className="text-teal-600 hover:underline">
                        ski trip budget guide
                    </Link>{" "}
                    for the full breakdown on multi-day trips.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Bottom Line
                </h2>
                <p>
                    Skiing from Provo is one of the best things about living in Utah
                    County. Don&apos;t let money math ruin it. Split gas and food, keep
                    lift tickets and rentals personal, and use a tracker so nobody has to
                    play accountant.
                </p>
                <p>
                    See you at Betos on the way home.
                </p>
            </div>

            <div className="mt-12 mb-8">
                <AuthorBio />
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Ski day coming up?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Create a tab before you leave. Settle up on the drive home.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start a Ski Day Tab →
                    </Link>
                    <p className="text-sm text-ink-400 mt-3">Free. No app download needed.</p>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/use-cases/ski-trips"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Use Case</span>
                        <p className="font-medium text-ink-900 mt-1">
                            Ski Trip Expense Splitter
                        </p>
                    </Link>
                    <Link
                        href="/blog/ski-trip-budget-guide"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Guide</span>
                        <p className="font-medium text-ink-900 mt-1">
                            Ski Trip Budget: How to Split Costs With Your Crew
                        </p>
                    </Link>
                </div>
            </div>
        </article>
    );
}
