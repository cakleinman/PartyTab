import type { Metadata } from "next";
import Link from "next/link";

import { AuthorBio } from "@/app/components/AuthorBio";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "How to Split Airbnb Costs Fairly When Rooms Are Different Sizes | PartyTab",
    description:
        "Master bedroom vs pull-out couch? Here's how to split vacation rental costs fairly when rooms aren't equal—4 methods with real examples.",
    keywords: [
        "split airbnb cost fairly",
        "divide vacation rental different rooms",
        "airbnb cost split unequal rooms",
        "how to split rental house cost",
        "fair share vacation rental",
    ],
    openGraph: {
        title: "How to Split Airbnb Costs Fairly When Rooms Are Different Sizes",
        description: "4 proven methods for splitting rental costs when rooms aren&apos;t equal.",
        url: "https://partytab.app/blog/split-airbnb-costs-different-rooms",
    },
    alternates: {
        canonical: "https://partytab.app/blog/split-airbnb-costs-different-rooms",
    },
};

export default function SplitAirbnbCostsDifferentRoomsPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="How to Split Airbnb Costs Fairly When Rooms Are Different Sizes"
                description="Master bedroom vs pull-out couch? Here's how to split vacation rental costs fairly when rooms aren't equal—4 methods with real examples."
                slug="split-airbnb-costs-different-rooms"
                datePublished="2026-03-05"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Split Airbnb Costs", url: "https://partytab.app/blog/split-airbnb-costs-different-rooms" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Split Airbnb Costs</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        GUIDE
                    </span>
                    <span className="text-sm text-ink-400">March 5, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">7 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    How to Split Airbnb Costs Fairly When Rooms Are Different Sizes
                </h1>
                <p className="text-xl text-ink-600">
                    Master suite vs pull-out couch? Here&apos;s how to split rental costs
                    when not all rooms are created equal.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    Your group just booked a beautiful lakeside Airbnb for $2,000. It has a
                    master bedroom with a king bed and ensuite bathroom, two regular
                    bedrooms with queens, and a pull-out couch in the living room.
                </p>
                <p>
                    Now comes the question everyone dreads: how do we split this fairly?
                </p>
                <p>
                    Dividing $2,000 by 6 people might be mathematically simple, but it
                    doesn&apos;t feel fair when one person gets a private bathroom and another
                    gets a sofa bed next to the kitchen.
                </p>

                <h2 id="equal-split-problem" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Problem with Equal Splits
                </h2>
                <p>
                    An even split works great when all the rooms are similar. But rental
                    homes rarely work out that way. Common scenarios:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Master bedroom with ensuite vs. shared bathroom rooms</li>
                    <li>King beds vs. twins or bunk beds</li>
                    <li>Private rooms vs. shared spaces or couches</li>
                    <li>Ground floor vs. attic or basement rooms</li>
                    <li>Rooms with views vs. rooms facing parking lots</li>
                </ul>
                <p>
                    When the gap is significant, an equal split can breed resentment. The
                    person on the couch feels overcharged. The master bedroom occupant feels
                    guilty. Nobody&apos;s happy.
                </p>

                <h2 id="methods" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    4 Methods for Splitting Fairly
                </h2>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Method 1: Room-Based Split
                </h3>
                <p>
                    Divide the total cost by number of rooms (or sleeping spaces), then
                    split within each room. This method treats rooms as units, not people.
                </p>
                <p>
                    <strong>Example:</strong> $2,000 Airbnb, 4 sleeping spaces (master,
                    bedroom 1, bedroom 2, couch)
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Cost per space: $2,000 ÷ 4 = $500</li>
                    <li>Master (1 couple): $500 total → $250/person</li>
                    <li>Bedroom 1 (2 people): $500 total → $250/person</li>
                    <li>Bedroom 2 (1 person): $500 solo</li>
                    <li>Couch (1 person): $500 solo</li>
                </ul>
                <p>
                    <strong>Pros:</strong> Simple, treats couples fairly. <strong>Cons:</strong> Solo
                    people pay way more, couch is still $500.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Method 2: Per-Person Equal Split
                </h3>
                <p>
                    Divide the cost evenly by people. Easiest approach, works when room
                    differences are minor.
                </p>
                <p>
                    <strong>Example:</strong> $2,000 ÷ 6 people = $333/person
                </p>
                <p>
                    <strong>Pros:</strong> Dead simple, mathematically fair. <strong>Cons:</strong> Ignores
                    room quality differences completely.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Method 3: Weighted/Tiered Approach
                </h3>
                <p>
                    Assign each room a tier (premium, standard, budget), then split
                    proportionally. This is the &quot;Goldilocks&quot; method—requires negotiation
                    but feels fairest.
                </p>
                <p>
                    <strong>Example:</strong> $2,000 Airbnb with tiered pricing
                </p>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Room</th>
                                <th className="text-center py-2">Tier</th>
                                <th className="text-right py-2">Weight</th>
                                <th className="text-right py-2">Cost</th>
                                <th className="text-right py-2">Per Person</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Master (ensuite)</td>
                                <td className="text-center py-2">Premium</td>
                                <td className="text-right py-2">1.5x</td>
                                <td className="text-right py-2">$545</td>
                                <td className="text-right py-2">$273 ea (2)</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Bedroom 1 (queen)</td>
                                <td className="text-center py-2">Standard</td>
                                <td className="text-right py-2">1.0x</td>
                                <td className="text-right py-2">$364</td>
                                <td className="text-right py-2">$182 ea (2)</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Bedroom 2 (queen)</td>
                                <td className="text-center py-2">Standard</td>
                                <td className="text-right py-2">1.0x</td>
                                <td className="text-right py-2">$364</td>
                                <td className="text-right py-2">$364 (solo)</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Pull-out couch</td>
                                <td className="text-center py-2">Budget</td>
                                <td className="text-right py-2">0.7x</td>
                                <td className="text-right py-2">$255</td>
                                <td className="text-right py-2">$255 (solo)</td>
                            </tr>
                            <tr className="font-semibold">
                                <td className="py-2">TOTAL</td>
                                <td className="text-center py-2"></td>
                                <td className="text-right py-2">5.2x</td>
                                <td className="text-right py-2">$2,000</td>
                                <td className="text-right py-2"></td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="text-xs text-ink-500 mt-4">
                        Formula: (room weight ÷ total weights) × total cost
                    </p>
                </div>

                <p>
                    <strong>Pros:</strong> Feels fairest for unequal rooms. <strong>Cons:</strong> Requires
                    group agreement on weights.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">💡 Pro tip</p>
                    <p className="text-amber-700 text-sm">
                        Decide the method before booking. Send a message: &quot;Master suite is
                        1.5x, regular rooms 1x, couch 0.7x—everyone cool with this?&quot; Get
                        buy-in early.
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Method 4: Per-Night Split (Different Arrival/Departure Dates)
                </h3>
                <p>
                    When people arrive or leave on different days, calculate per-night costs
                    per person.
                </p>
                <p>
                    <strong>Example:</strong> 3-night Airbnb ($600 total), 4 people but
                    different schedules
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Cost per night: $600 ÷ 3 = $200/night</li>
                    <li>Alice (3 nights, solo room): $200 × 3 = $600</li>
                    <li>Bob & Carol (3 nights, shared room): $100 × 3 = $300 each</li>
                    <li>Dan (2 nights, couch): $67 × 2 = $134</li>
                </ul>
                <p>
                    <strong>Pros:</strong> Fair for partial stays. <strong>Cons:</strong> More complex math.
                </p>

                <h2 id="common-areas" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Don&apos;t Forget Common Areas
                </h2>
                <p>
                    Everyone uses the kitchen, living room, deck, and pool equally. That
                    shared value is part of why you rented a house instead of hotel rooms.
                </p>
                <p>
                    Some groups split the cost into two buckets:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>50% for common areas</strong> (split equally by person)
                    </li>
                    <li>
                        <strong>50% for bedrooms</strong> (split by method 1, 2, or 3)
                    </li>
                </ul>
                <p>
                    This balances the &quot;you got the better room&quot; issue with the &quot;but we all
                    used the hot tub&quot; reality.
                </p>

                <h2 id="before-booking" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Conversation to Have BEFORE Booking
                </h2>
                <p>
                    Never book first and figure out splits later. That&apos;s how friendships end.
                </p>
                <p>
                    <strong>Template message to send your group:</strong>
                </p>
                <div className="bg-sand-50 rounded-2xl p-6 my-6">
                    <p className="text-sm text-ink-700 italic">
                        &quot;Found an amazing place for $2,000! It has a master suite (king + ensuite),
                        2 queen bedrooms, and a pull-out couch. How should we split it? I&apos;m
                        thinking master pays a bit more since it&apos;s nicer. Thoughts?&quot;
                    </p>
                </div>
                <p>
                    Let the group discuss. If someone volunteers for the couch at a discount,
                    great. If two people want the master and are willing to pay premium, even
                    better. Just get consensus before anyone&apos;s credit card is charged.
                </p>

                <h2 id="tracking" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    How to Track It
                </h2>
                <p>
                    Once you&apos;ve agreed on the split method, actually collecting the money is
                    the next hurdle.
                </p>
                <p>
                    <strong>Standard approach:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>One person books the Airbnb on their credit card</li>
                    <li>Log the expense in a tracker with custom amounts per person</li>
                    <li>Everyone reimburses that person their calculated share</li>
                </ul>
                <p>
                    Don&apos;t forget to include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Airbnb service fees (add ~14% to the nightly rate)</li>
                    <li>Cleaning fee (often $150–$300, split it separately or include in total)</li>
                    <li>Occupancy taxes</li>
                </ul>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 Perfect for vacation rentals
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        PartyTab lets you set custom split amounts—not just even splits. Log
                        the Airbnb cost, assign each person their weighted share ($273 for
                        master, $182 for bedrooms, etc.), and everyone sees exactly what they
                        owe. No spreadsheet needed.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        Create a trip tab →
                    </Link>
                </div>

                <h2 id="special-cases" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Special Cases & Edge Situations
                </h2>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Kids & Families
                </h3>
                <p>
                    Does a 5-year-old count as a full person? Usually no. Common approach:
                    kids under 12 count as 0.5 person for cost-splitting.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    The &quot;I&apos;ll Just Take Whatever&apos;s Left&quot; Friend
                </h3>
                <p>
                    Someone always offers to take the worst room for less money. Generous,
                    but make sure the discount is meaningful—don&apos;t lowball them $20 when
                    they&apos;re sleeping on a futon.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Last-Minute Additions
                </h3>
                <p>
                    If someone joins after booking, recalculate from scratch. Don&apos;t just
                    charge them a sixth of the remaining balance—that&apos;s how arguments start.
                </p>
            </div>


            <div className="mt-12 mb-8">
                <AuthorBio />
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Splitting a rental with friends?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Track Airbnb costs, groceries, and more with custom splits—because not
                        everyone deserves to pay the same.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start Your Trip Tab →
                    </Link>
                    <p className="text-sm text-ink-400 mt-3">
                        Free. No app download needed.
                    </p>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/blog/girls-trip-budget-planning"
                        className="block p-4 border border-sand-200 rounded-xl hover:border-teal-300 transition-colors"
                    >
                        <span className="text-xs text-teal-600 font-semibold">GUIDE</span>
                        <h4 className="font-semibold text-ink-900 mt-1">
                            Girls Trip Budget Planning
                        </h4>
                    </Link>
                    <Link
                        href="/blog/settle-up-after-group-trip"
                        className="block p-4 border border-sand-200 rounded-xl hover:border-teal-300 transition-colors"
                    >
                        <span className="text-xs text-teal-600 font-semibold">GUIDE</span>
                        <h4 className="font-semibold text-ink-900 mt-1">
                            Settle Up After a Group Trip
                        </h4>
                    </Link>
                </div>
            </div>
        </article>
    );
}
