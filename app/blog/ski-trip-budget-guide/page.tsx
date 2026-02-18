import type { Metadata } from "next";
import Link from "next/link";

import { AuthorBio } from "@/app/components/AuthorBio";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "Ski Trip Budget: How to Split Costs With Your Crew | PartyTab",
    description:
        "Planning a ski weekend with friends? Here's how to budget for lodging, lift tickets, rentals, and après-ski—plus fair ways to split the costs.",
    keywords: [
        "ski trip budget",
        "split ski trip costs",
        "ski weekend expenses",
        "group ski trip planning",
        "ski house cost sharing",
        "ski vacation budget",
    ],
    openGraph: {
        type: "article",
        title: "Ski Trip Budget: How to Split Costs With Your Crew",
        description: "Budget tips and expense splitting for your next ski weekend.",
        url: "https://partytab.app/blog/ski-trip-budget-guide",
        images: OG_IMAGE,
    },
    twitter: {
        card: "summary_large_image",
        title: "Ski Trip Budget: How to Split Costs With Your Crew",
        description: "Budget tips and expense splitting for your next ski weekend.",
        images: TWITTER_IMAGE,
    },
    alternates: {
        canonical: "https://partytab.app/blog/ski-trip-budget-guide",
    },
};

export default function SkiTripBudgetGuidePage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="Ski Trip Budget: How to Split Costs With Your Crew"
                description="Planning a ski weekend with friends? Here's how to budget for lodging, lift tickets, rentals, and après-ski—plus fair ways to split the costs."
                slug="ski-trip-budget-guide"
                datePublished="2026-01-15"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Ski Trip Budget Guide", url: "https://partytab.app/blog/ski-trip-budget-guide" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Ski Trip Budget Guide</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        GUIDE
                    </span>
                    <span className="text-sm text-ink-400">January 15, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">6 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    Ski Trip Budget: How to Split Costs With Your Crew
                </h1>
                <p className="text-xl text-ink-600">
                    Lift tickets. Lodging. Rentals. Après drinks. Here&apos;s how to keep
                    track without wiping out.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    Ski trips are expensive. Between lodging, lift tickets, equipment,
                    food, and the inevitable $18 mountain beers, costs add up fast.
                    When you&apos;re going with a group, the expense-splitting math can get
                    as gnarly as a double black diamond.
                </p>
                <p>
                    Here&apos;s how to budget, split costs fairly, and actually enjoy the
                    mountain instead of stressing about money.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    What Does a Ski Weekend Actually Cost?
                </h2>
                <p>
                    For a 2–3 night trip to a major resort (Vail, Park City, Tahoe), expect:
                </p>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Category</th>
                                <th className="text-right py-2">Budget Range</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Lodging (per night, shared house)</td>
                                <td className="text-right py-2">$50–$150/person</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Lift tickets (per day)</td>
                                <td className="text-right py-2">$100–$250/person</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Equipment rental (per day)</td>
                                <td className="text-right py-2">$50–$100/person</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Food & drinks</td>
                                <td className="text-right py-2">$50–$100/day</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Transportation</td>
                                <td className="text-right py-2">Varies</td>
                            </tr>
                            <tr className="font-semibold">
                                <td className="py-2">3-Day Weekend Total</td>
                                <td className="text-right py-2">$500–$1,200/person</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    Prices vary wildly by resort, time of season, and whether you&apos;re
                    renting or own your gear. Plan for the higher end and be pleasantly
                    surprised if it&apos;s less.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    What to Split vs. What&apos;s Individual
                </h2>

                <div className="bg-sand-50 rounded-2xl p-6 my-6">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-medium text-ink-900 mb-2">✓ Usually Shared</p>
                            <ul className="space-y-1 text-ink-700">
                                <li>• Ski house or condo rental</li>
                                <li>• Groceries for the house</li>
                                <li>• Shared transportation (gas, rental car)</li>
                                <li>• Communal après supplies</li>
                                <li>• Hot tub beers 🍺</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium text-ink-900 mb-2">✗ Usually Individual</p>
                            <ul className="space-y-1 text-ink-700">
                                <li>• Lift tickets (buy your own)</li>
                                <li>• Equipment rental</li>
                                <li>• Lessons</li>
                                <li>• On-mountain food</li>
                                <li>• Personal après tabs</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Ski House Dilemma: Bedrooms Aren&apos;t Equal
                </h2>
                <p>
                    Ski houses often have a mix of master suites, normal rooms, and
                    pull-out couches. Should the person in the king bed pay more than
                    the one on the futon?
                </p>
                <p>
                    <strong>Common approaches:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Split evenly anyway:</strong> Simplest. Works if everyone is
                        flexible and rooms aren&apos;t dramatically different.
                    </li>
                    <li>
                        <strong>Tiered pricing:</strong> Master bedroom pays $X more per
                        night than single rooms, which pay more than shared/couch spots.
                    </li>
                    <li>
                        <strong>Lottery system:</strong> Randomly assign rooms, split cost
                        evenly. Nobody can complain about what they got.
                    </li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">💡 Pro tip</p>
                    <p className="text-amber-700 text-sm">
                        Decide room assignments before anyone drives 4 hours. Nothing kills
                        the vibe like an arrival-day room drama.
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Lift Tickets: Everyone for Themselves
                </h2>
                <p>
                    Lift tickets are almost always individual purchases. People ski
                    different days, some have passes, others find deals. Don&apos;t try to
                    group-buy unless you&apos;re getting an actual group discount.
                </p>
                <p>
                    <strong>Money-saving tips:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Buy online in advance (often 10–20% off window price)</li>
                    <li>Check if anyone has a pass with buddy tickets</li>
                    <li>Local grocery stores sometimes sell discounted tickets</li>
                    <li>Consider a half-day ticket if you&apos;re tired/hungover</li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Grocery Run
                </h2>
                <p>
                    Cooking at the ski house saves a fortune vs. eating out. One person
                    usually does the Costco run—make sure they get reimbursed.
                </p>
                <p>
                    <strong>Smart approach:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Create a shared shopping list before the trip</li>
                    <li>One person shops, saves receipt, logs it in the expense tracker</li>
                    <li>Split among everyone staying at the house</li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Track Everything in Real-Time
                </h2>
                <p>
                    Ski trips involve a lot of small purchases: someone grabs breakfast
                    burritos, another person fills up the rental car, someone buys hot
                    cocoa for the group on the lift.
                </p>
                <p>
                    <strong>The move:</strong> Log expenses as they happen. Nobody will
                    remember $14 here and $23 there by Sunday afternoon.
                </p>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 Perfect for ski trips
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        Create a PartyTab, share the link, and everyone logs shared
                        expenses from their phone—even from the chairlift. At the end of
                        the trip, settle up with minimal payments.
                    </p>
                    <Link
                        href="/use-cases/ski-trips"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        See how it works for ski trips →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Sample Ski Weekend Budget (6 people, 3 nights)
                </h2>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Shared Expenses</th>
                                <th className="text-right py-2">Total</th>
                                <th className="text-right py-2">Per Person</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Ski house (3 nights)</td>
                                <td className="text-right py-2">$1,800</td>
                                <td className="text-right py-2">$300</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Rental car + gas</td>
                                <td className="text-right py-2">$400</td>
                                <td className="text-right py-2">$67</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Groceries</td>
                                <td className="text-right py-2">$350</td>
                                <td className="text-right py-2">$58</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Hot tub supplies & drinks</td>
                                <td className="text-right py-2">$150</td>
                                <td className="text-right py-2">$25</td>
                            </tr>
                            <tr className="font-semibold">
                                <td className="py-2">TOTAL SHARED</td>
                                <td className="text-right py-2">$2,700</td>
                                <td className="text-right py-2">$450</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="text-xs text-ink-500 mt-4">
                        *Individual costs (lift tickets, rentals, on-mountain food) extra: ~$300–$500/person
                    </p>
                </div>
            </div>


            <div className="mt-12 mb-8">
                <AuthorBio />
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Planning a ski trip?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Track house costs, gas, groceries—settle up after the last run.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start Your Ski Trip Tab →
                    </Link>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/blog/split-airbnb-costs-different-rooms"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Tips</span>
                        <p className="font-medium text-ink-900 mt-1">
                            How to Split Airbnb Costs Fairly When Rooms Are Different Sizes
                        </p>
                    </Link>
                    <Link
                        href="/blog/settle-up-after-group-trip"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Tips</span>
                        <p className="font-medium text-ink-900 mt-1">
                            How to Settle Up After a Group Trip
                        </p>
                    </Link>
                </div>
            </div>
        </article>
    );
}
