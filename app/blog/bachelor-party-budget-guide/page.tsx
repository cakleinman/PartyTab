import type { Metadata } from "next";
import Link from "next/link";

import { AuthorBio } from "@/app/components/AuthorBio";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "The Ultimate Bachelor Party Budget Guide (2026) | PartyTab",
    description:
        "Planning a bachelor party? Here's how to set a realistic budget, split costs fairly among the groomsmen, and avoid awkward money conversations. Free template included.",
    keywords: [
        "bachelor party budget",
        "bachelor party cost",
        "how much to spend on bachelor party",
        "bachelor party expenses",
        "split bachelor party costs",
        "groomsmen expenses",
    ],
    openGraph: {
        title: "The Ultimate Bachelor Party Budget Guide (2026)",
        description:
            "Set a realistic budget, split costs fairly, and avoid awkward money talks.",
        url: "https://partytab.app/blog/bachelor-party-budget-guide",
    },
    alternates: {
        canonical: "https://partytab.app/blog/bachelor-party-budget-guide",
    },
};

export default function BachelorPartyBudgetGuidePage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="The Ultimate Bachelor Party Budget Guide (2026)"
                description="Planning a bachelor party? Here's how to set a realistic budget, split costs fairly among the groomsmen, and avoid awkward money conversations. Free template included."
                slug="bachelor-party-budget-guide"
                datePublished="2026-01-24"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Bachelor Party Budget Guide", url: "https://partytab.app/blog/bachelor-party-budget-guide" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Bachelor Party Budget Guide</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        GUIDE
                    </span>
                    <span className="text-sm text-ink-400">January 24, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">8 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    The Ultimate Bachelor Party Budget Guide
                </h1>
                <p className="text-xl text-ink-600">
                    How to plan an epic send-off without anyone going broke—or getting
                    resentful.
                </p>
            </header>

            {/* Table of Contents */}
            <div className="bg-sand-50 rounded-2xl p-6 mb-12">
                <h2 className="font-semibold text-ink-900 mb-3">In This Guide</h2>
                <ul className="space-y-2 text-sm">
                    <li>
                        <a href="#average-cost" className="text-teal-600 hover:underline">
                            What Does a Bachelor Party Actually Cost?
                        </a>
                    </li>
                    <li>
                        <a href="#setting-budget" className="text-teal-600 hover:underline">
                            How to Set a Budget Everyone Can Afford
                        </a>
                    </li>
                    <li>
                        <a href="#who-pays" className="text-teal-600 hover:underline">
                            Who Pays for What?
                        </a>
                    </li>
                    <li>
                        <a href="#splitting-costs" className="text-teal-600 hover:underline">
                            The Right Way to Split Costs
                        </a>
                    </li>
                    <li>
                        <a href="#budget-breakdown" className="text-teal-600 hover:underline">
                            Sample Budget Breakdown
                        </a>
                    </li>
                    <li>
                        <a href="#saving-money" className="text-teal-600 hover:underline">
                            Tips for Saving Money
                        </a>
                    </li>
                </ul>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    Planning a bachelor party is exciting—until you realize you&apos;re also
                    the unofficial accountant, debt collector, and therapist for a group of
                    guys who suddenly have very different ideas about what &quot;reasonable
                    spending&quot; means.
                </p>
                <p>
                    This guide will help you set a budget that works for everyone, figure out
                    who pays for what, and actually collect the money without anyone ghosting
                    the group chat.
                </p>

                <h2 id="average-cost" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    What Does a Bachelor Party Actually Cost?
                </h2>
                <p>
                    Let&apos;s start with reality. According to wedding industry data, the
                    average bachelor party costs:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Local night out:</strong> $200–$500 per person</li>
                    <li><strong>Weekend trip (domestic):</strong> $500–$1,500 per person</li>
                    <li><strong>Destination weekend (Vegas, Miami, etc.):</strong> $1,000–$3,000 per person</li>
                    <li><strong>International trip:</strong> $2,000–$5,000+ per person</li>
                </ul>
                <p>
                    These numbers include lodging, activities, food, drinks, and
                    transportation. The groom&apos;s share is typically covered by the group,
                    which adds 10–15% to everyone else&apos;s costs.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">💡 Reality check</p>
                    <p className="text-amber-700 text-sm">
                        These are averages. Your friend group might be fine with a $150 night
                        out or happily drop $4k on a week in Ibiza. The key is knowing your
                        audience before you start planning.
                    </p>
                </div>

                <h2 id="setting-budget" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    How to Set a Budget Everyone Can Afford
                </h2>
                <p>
                    The biggest mistake best men make? Planning an epic weekend and then
                    asking the group to pay for it. Here&apos;s the right order:
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    1. Survey the group FIRST
                </h3>
                <p>
                    Before you book anything, send a quick anonymous poll. Ask:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>What&apos;s your comfortable budget for the bachelor party? ($X – $Y)</li>
                    <li>What dates work for you?</li>
                    <li>Any activities you definitely want or definitely don&apos;t want?</li>
                </ul>
                <p>
                    Use the <strong>lowest comfortable budget</strong> as your ceiling.
                    Yes, even if one guy says he&apos;d spend $5k. You&apos;re planning for the
                    group, not the outliers.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    2. Plan to the budget, not the dream
                </h3>
                <p>
                    If the group&apos;s max is $600 per person, you&apos;re not going to Vegas.
                    That&apos;s fine! Some of the best bachelor parties happen at lake houses,
                    local golf courses, or backyard BBQs.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    3. Add a 15–20% buffer
                </h3>
                <p>
                    Things always cost more than expected. If your target is $500/person,
                    plan activities that total $400–$425. Leave room for the inevitable
                    &quot;one more round&quot; and Uber surges.
                </p>

                <h2 id="who-pays" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Who Pays for What?
                </h2>
                <p>
                    This is where most bachelor party drama happens. Here&apos;s the generally
                    accepted etiquette:
                </p>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6">
                    <h4 className="font-semibold text-ink-900 mb-4">The Standard Split</h4>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Expense</th>
                                <th className="text-left py-2">Who Pays</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Groom&apos;s lodging</td>
                                <td className="py-2">Split among groomsmen</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Groom&apos;s activities</td>
                                <td className="py-2">Split among groomsmen</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Groom&apos;s share of food</td>
                                <td className="py-2">Split among groomsmen</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Groom&apos;s drinks</td>
                                <td className="py-2">Each person buys him a round (informal)</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Groom&apos;s flights</td>
                                <td className="py-2">Typically the groom pays (or split if budget allows)</td>
                            </tr>
                            <tr>
                                <td className="py-2">Everyone else&apos;s expenses</td>
                                <td className="py-2">Each person pays their share</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    <strong>Important:</strong> Communicate this upfront. Nothing kills vibes
                    faster than someone expecting a free ride or someone feeling ambushed by
                    costs they didn&apos;t expect.
                </p>

                <h2 id="splitting-costs" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Right Way to Split Costs
                </h2>
                <p>
                    Once you&apos;ve got a budget and plan, you need to actually track who pays
                    for what. Here are your options:
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    ❌ The &quot;We&apos;ll figure it out later&quot; approach
                </h3>
                <p>
                    Never works. By Sunday, no one remembers who paid for the Uber, the bar
                    tab, or the second round of golf cart rentals. Someone ends up resentful.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    ❌ One person pays everything upfront
                </h3>
                <p>
                    Puts too much financial burden on one person. And good luck getting
                    reimbursed from 8 guys after the hangover wears off.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    ✅ Shared expense tracker (recommended)
                </h3>
                <p>
                    Use an app where everyone logs expenses in real-time. At the end of the
                    trip, it calculates exactly who owes who—no spreadsheets, no arguments.
                </p>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 This is exactly why we built PartyTab
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        Create a shared tab, send the link to the group, and everyone logs
                        expenses as they happen. No app downloads, no accounts needed. At the
                        end, everyone settles up with minimal payments.
                    </p>
                    <Link
                        href="/use-cases/bachelor-party"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        See how it works for bachelor parties →
                    </Link>
                </div>

                <h2 id="budget-breakdown" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Sample Budget Breakdown
                </h2>
                <p>
                    Here&apos;s a realistic breakdown for a weekend trip (2 nights) with 8
                    people at a $600/person budget:
                </p>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Category</th>
                                <th className="text-right py-2">Total</th>
                                <th className="text-right py-2">Per Person</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Airbnb (4 bedroom house)</td>
                                <td className="text-right py-2">$1,200</td>
                                <td className="text-right py-2">$150</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Golf (18 holes + carts)</td>
                                <td className="text-right py-2">$640</td>
                                <td className="text-right py-2">$80</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Steakhouse dinner</td>
                                <td className="text-right py-2">$800</td>
                                <td className="text-right py-2">$100</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Bar night (2 nights)</td>
                                <td className="text-right py-2">$1,200</td>
                                <td className="text-right py-2">$150</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Groceries & drinks for house</td>
                                <td className="text-right py-2">$400</td>
                                <td className="text-right py-2">$50</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Transportation</td>
                                <td className="text-right py-2">$240</td>
                                <td className="text-right py-2">$30</td>
                            </tr>
                            <tr className="font-semibold">
                                <td className="py-2">SUBTOTAL</td>
                                <td className="text-right py-2">$4,480</td>
                                <td className="text-right py-2">$560</td>
                            </tr>
                            <tr className="text-ink-500">
                                <td className="py-2">+ Buffer (15%)</td>
                                <td className="text-right py-2">$672</td>
                                <td className="text-right py-2">$84</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="text-xs text-ink-500 mt-4">
                        *Groom&apos;s share ($560) split among 7 groomsmen = extra $80 each
                    </p>
                </div>

                <h2 id="saving-money" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Tips for Saving Money
                </h2>
                <ul className="list-disc pl-6 space-y-3">
                    <li>
                        <strong>Book lodging with a kitchen.</strong> Breakfast and lunch at the
                        house saves $50–$100 per person over the weekend.
                    </li>
                    <li>
                        <strong>Pre-game before going out.</strong> Bar drinks are 3–4x the cost
                        of a bottle at the house. Get the party started before you leave.
                    </li>
                    <li>
                        <strong>Book activities in advance.</strong> Golf courses, boat rentals,
                        and group activities often have early-bird or group discounts.
                    </li>
                    <li>
                        <strong>Skip the bottle service.</strong> Unless someone specifically
                        wants to splurge, it&apos;s usually not worth it.
                    </li>
                    <li>
                        <strong>Consider shoulder season.</strong> Going to a ski town in
                        October or a beach town in May can cut lodging costs by 30–50%.
                    </li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Awkward Money Talk (Have It Early)
                </h2>
                <p>
                    The best man&apos;s job is to have the uncomfortable conversation before it
                    becomes a problem. Early in planning, say something like:
                </p>
                <blockquote className="border-l-4 border-sand-300 pl-4 italic text-ink-600 my-6">
                    &quot;Hey everyone—let&apos;s get on the same page about budget. I&apos;m thinking
                    we aim for around $X per person, including covering [groom&apos;s name].
                    Does that work for everyone? If anyone&apos;s tight on cash, let me know
                    privately and we can figure it out.&quot;
                </blockquote>
                <p>
                    That last part matters. Someone might be struggling financially but too
                    embarrassed to say it in the group. Give them an out.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Final Checklist
                </h2>
                <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="text-teal-600">☐</span>
                        Survey the group for budget and dates
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-teal-600">☐</span>
                        Set a per-person budget (use the lowest comfortable number)
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-teal-600">☐</span>
                        Communicate who pays for the groom upfront
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-teal-600">☐</span>
                        <span>Set up a shared expense tracker (<Link href="/tabs/new" className="text-teal-600 hover:underline">create a PartyTab</Link>)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-teal-600">☐</span>
                        Collect deposits for big bookings early
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-teal-600">☐</span>
                        Keep a 15–20% buffer for surprises
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-teal-600">☐</span>
                        Settle up within a week of returning home
                    </li>
                </ul>
            </div>

            <div className="mt-12 mb-8">
                <AuthorBio />
            </div>

            {/* Author / CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Planning a bachelor party?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Create a shared tab in 30 seconds. Share the link. Everyone logs
                        expenses. Settle up with one click.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start Your Bachelor Party Tab →
                    </Link>
                    <p className="text-sm text-ink-400 mt-3">Free. No app download needed.</p>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/use-cases/bachelor-party"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Use Case</span>
                        <p className="font-medium text-ink-900 mt-1">
                            Bachelor Party Expense Splitting
                        </p>
                    </Link>
                    <Link
                        href="/blog"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Blog</span>
                        <p className="font-medium text-ink-900 mt-1">
                            More Tips & Guides
                        </p>
                    </Link>
                </div>
            </div>
        </article>
    );
}
