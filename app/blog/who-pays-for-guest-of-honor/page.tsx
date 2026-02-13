import type { Metadata } from "next";
import Link from "next/link";

import { AuthorBio } from "@/app/components/AuthorBio";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "Bachelor/ette Party Expenses: Who Pays for the Guest of Honor? | PartyTab",
    description:
        "The average bachelor/ette party costs $1,300-$1,500 per guest. Here's exactly what the group covers for the guest of honor and what they don't.",
    keywords: [
        "who pays for bride bachelorette",
        "do groomsmen pay for groom bachelor party",
        "guest of honor expenses etiquette",
        "split bachelor party costs groom",
        "bachelorette party who covers bride",
    ],
    openGraph: {
        title: "Bachelor/ette Party Expenses: Who Pays for the Guest of Honor?",
        description:
            "What the group covers for the guest of honor and what they don't.",
        url: "https://partytab.app/blog/who-pays-for-guest-of-honor",
    },
    alternates: {
        canonical: "https://partytab.app/blog/who-pays-for-guest-of-honor",
    },
};

export default function WhoPaysForGuestOfHonorPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="Bachelor/ette Party Expenses: Who Pays for the Guest of Honor?"
                description="The average bachelor/ette party costs $1,300-$1,500 per guest. Here's exactly what the group covers for the guest of honor and what they don't."
                slug="who-pays-for-guest-of-honor"
                datePublished="2026-04-16"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Who Pays for the Guest of Honor?", url: "https://partytab.app/blog/who-pays-for-guest-of-honor" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Who Pays for the Guest of Honor?</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        ADVICE
                    </span>
                    <span className="text-sm text-ink-400">April 16, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">6 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    Bachelor/ette Party Expenses: Who Pays for the Guest of Honor?
                </h1>
                <p className="text-xl text-ink-600">
                    The average bachelor/ette party now costs $1,300-$1,500 per guest. And somewhere in that number, you&apos;re also covering the guest of honor. Here&apos;s how the money works.
                </p>
            </header>

            {/* Table of Contents */}
            <div className="bg-sand-50 rounded-2xl p-6 mb-12">
                <h2 className="font-semibold text-ink-900 mb-3">In This Article</h2>
                <ul className="space-y-2 text-sm">
                    <li>
                        <a href="#general-rule" className="text-teal-600 hover:underline">
                            The General Rule
                        </a>
                    </li>
                    <li>
                        <a href="#what-group-covers" className="text-teal-600 hover:underline">
                            What the Group Covers vs. What They Don&apos;t
                        </a>
                    </li>
                    <li>
                        <a href="#math" className="text-teal-600 hover:underline">
                            How Much Extra Does It Cost Each Person?
                        </a>
                    </li>
                    <li>
                        <a href="#chip-in" className="text-teal-600 hover:underline">
                            When the Guest of Honor Should Chip In
                        </a>
                    </li>
                    <li>
                        <a href="#conversation" className="text-teal-600 hover:underline">
                            How to Have the Money Conversation
                        </a>
                    </li>
                </ul>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    You just got asked to be in a wedding party. Congratulations—you&apos;re now financially responsible for someone else&apos;s good time.
                </p>
                <p>
                    Bachelor and bachelorette parties have ballooned into multi-day destination weekends that rival actual vacations in cost. And somewhere between the flights, the Airbnb, the activities, and the inevitable &quot;just one more round,&quot; you&apos;re also covering the bride or groom.
                </p>
                <p>
                    So who pays for what? Let&apos;s break down the etiquette, the math, and how to have the conversation without making it awkward.
                </p>

                <h2 id="general-rule" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The General Rule
                </h2>
                <p>
                    Here&apos;s the widely accepted standard:
                </p>
                <p className="bg-sand-50 border-l-4 border-teal-500 pl-4 py-2">
                    <strong>The group covers the guest of honor&apos;s shared expenses.</strong> The guest of honor covers their own travel and personal expenses.
                </p>
                <p>
                    Translation: if the group is splitting an Airbnb, group dinners, activities, and transportation, the bride or groom&apos;s portion of those costs gets divided among the attendees. But they&apos;re still booking their own flight and buying their own souvenirs.
                </p>

                <h2 id="what-group-covers" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    What the Group Covers vs. What They Don&apos;t
                </h2>
                <p>
                    Here&apos;s where confusion (and resentment) usually starts. Let&apos;s clarify exactly what falls into each category.
                </p>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2 pr-4">Expense</th>
                                <th className="text-left py-2">Who Pays</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-3 pr-4 font-medium text-teal-900">GROUP COVERS</td>
                                <td className="py-3"></td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 pr-4 pl-4">Lodging (Airbnb, hotel)</td>
                                <td className="py-2">Split among attendees</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 pr-4 pl-4">Group activities (golf, boat rental, spa)</td>
                                <td className="py-2">Split among attendees</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 pr-4 pl-4">Group meals (dinners, brunches)</td>
                                <td className="py-2">Split among attendees</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 pr-4 pl-4">Their share of Ubers, taxis, rideshares</td>
                                <td className="py-2">Split among attendees</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-3 pr-4 font-medium text-ink-900">GUEST OF HONOR COVERS</td>
                                <td className="py-3"></td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 pr-4 pl-4">Flights or travel to destination</td>
                                <td className="py-2">Guest of honor</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 pr-4 pl-4">Personal shopping, souvenirs</td>
                                <td className="py-2">Guest of honor</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 pr-4 pl-4">Personal drinks beyond group rounds</td>
                                <td className="py-2">Guest of honor</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-3 pr-4 font-medium text-amber-800">GRAY AREA (DISCUSS UPFRONT)</td>
                                <td className="py-3"></td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2 pr-4 pl-4">Bottle service, VIP upgrades</td>
                                <td className="py-2">Depends on budget</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 pl-4">Guest of honor&apos;s choice of activity</td>
                                <td className="py-2">Discuss with group</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    The gray area items are where you need to communicate. If the bride wants to go skydiving and half the group is terrified of heights, does everyone chip in for her jump? That&apos;s a group decision, not a given.
                </p>

                <h2 id="math" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    How Much Extra Does It Cost Each Person?
                </h2>
                <p>
                    Let&apos;s do the math on a real scenario so you know what you&apos;re signing up for.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Scenario: Weekend Bachelorette Party
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>8 people total (bride + 7 bridesmaids)</li>
                    <li>3-night Airbnb: $2,400 total</li>
                    <li>Boat rental: $800</li>
                    <li>Group dinner: $640</li>
                    <li>Brunch: $240</li>
                    <li>Ubers/transportation: $200</li>
                </ul>

                <p className="font-semibold mt-6">
                    Total shared expenses: $4,280
                </p>
                <p>
                    The bride&apos;s share of those expenses (if split 8 ways): <strong>$535</strong>
                </p>
                <p>
                    Split among the 7 bridesmaids: <strong>$535 ÷ 7 = $76 extra per person</strong>
                </p>

                <div className="bg-sand-50 border border-sand-200 rounded-2xl p-6 my-6">
                    <p className="text-sm font-medium text-ink-900 mb-2">The Full Cost Per Bridesmaid:</p>
                    <ul className="text-sm space-y-1">
                        <li>Your share of expenses: $535</li>
                        <li>+ Your share of covering the bride: $76</li>
                        <li>+ Your flight (not shared): ~$300</li>
                        <li className="pt-2 font-semibold text-ink-900 border-t border-sand-300 mt-2">
                            Total per person: ~$911
                        </li>
                    </ul>
                </div>

                <p>
                    That&apos;s how a $535 trip becomes a $911 trip. And that&apos;s before the inevitable &quot;one more round&quot; or late-night pizza run.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">💡 Reality check</p>
                    <p className="text-amber-700 text-sm">
                        $1,300 per guest is the AVERAGE. You don&apos;t need to hit that number. Some of the best bachelor/ette parties happen for $200/person at a lake house. The goal is celebration, not financial stress.
                    </p>
                </div>

                <h2 id="chip-in" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    When the Guest of Honor Should Chip In
                </h2>
                <p>
                    The standard rule is that the group covers the guest of honor. But there are situations where it&apos;s reasonable to ask them to contribute:
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    1. They Insist on an Extravagant Destination
                </h3>
                <p>
                    If the bride or groom is pushing for Cabo when the group suggested a local weekend, they should either scale back or contribute to their own costs. You&apos;re celebrating them, not funding their dream vacation.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    2. Their Taste Exceeds the Group&apos;s Budget
                </h3>
                <p>
                    If they want bottle service at every club or a $200/person tasting menu when the group is comfortable with a $50 dinner, they can cover the upgrade for themselves.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    3. The Group Is Small (3-4 People)
                </h3>
                <p>
                    When the group is tiny, covering the guest of honor&apos;s share can add $150-$300 per person. At that point, it&apos;s fair to discuss splitting costs evenly, including the guest of honor.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    4. They Offer
                </h3>
                <p>
                    Some brides and grooms recognize the financial burden and offer to pay their share. If they do, accept graciously. It&apos;s not a rejection of the gesture—it&apos;s consideration for their friends.
                </p>

                <h2 id="conversation" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    How to Have the Money Conversation
                </h2>
                <p>
                    The maid of honor or best man needs to have the money talk early. Here&apos;s how to do it without making it weird.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Template Message to the Group
                </h3>
                <blockquote className="border-l-4 border-sand-300 pl-4 italic text-ink-600 my-6">
                    &quot;Hey everyone! We&apos;re planning [bride/groom]&apos;s bachelor/ette party and want to make sure we&apos;re all on the same page about budget.
                    <br /><br />
                    Here&apos;s the current plan: [destination/dates]. Estimated cost per person is around $X, which includes covering [bride/groom]&apos;s share of lodging, activities, and group meals. Flights are separate.
                    <br /><br />
                    Does this work for everyone? If budget is tight, let me know privately and we can figure it out. Want this to be fun for everyone!&quot;
                </blockquote>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Key Principles
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Be transparent early.</strong> Don&apos;t surprise people with costs after plans are booked.</li>
                    <li><strong>Break down the numbers.</strong> Show how you arrived at the per-person cost.</li>
                    <li><strong>Offer flexibility.</strong> Let people opt out or suggest alternatives without guilt.</li>
                    <li><strong>Normalize saying no.</strong> Not everyone can afford every plan, and that&apos;s okay.</li>
                </ul>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 PartyTab Makes Custom Splits Easy
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        Create a tab for your bachelor or bachelorette party. Use custom splits to exclude the guest of honor from expenses the group is covering. Everyone sees exactly what they owe in real-time. No spreadsheets, no awkward reminders.
                    </p>
                    <Link
                        href="/use-cases/bachelor-party"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        See How It Works →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Bottom Line
                </h2>
                <p>
                    The standard etiquette is clear: the group covers the guest of honor&apos;s shared expenses (lodging, activities, group meals). The guest of honor covers their own travel and personal costs.
                </p>
                <p>
                    But etiquette isn&apos;t a contract. If the guest of honor wants a $3,000/person destination and the group is comfortable with $500, have the conversation. Either scale back the plans, ask them to contribute, or accept that not everyone can attend.
                </p>
                <p>
                    The goal is to celebrate your friend—not put everyone in debt. Be transparent about costs early, normalize budget conversations, and use tools that make splitting fair and easy.
                </p>
                <p>
                    Because the best bachelor and bachelorette parties aren&apos;t the most expensive ones. They&apos;re the ones where everyone actually shows up.
                </p>
            </div>


            <div className="mt-12 mb-8">
                <AuthorBio />
            </div>

            {/* Author / CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Planning a bachelor or bachelorette party?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        PartyTab tracks who&apos;s covering the guest of honor with custom splits. Everyone sees what they owe, and you settle up with minimal payments.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Create Your Party Tab →
                    </Link>
                    <p className="text-sm text-ink-400 mt-3">Free. No app download needed.</p>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/blog/bachelor-party-budget-guide"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Guide</span>
                        <p className="font-medium text-ink-900 mt-1">
                            The Ultimate Bachelor Party Budget Guide
                        </p>
                    </Link>
                    <Link
                        href="/blog/bachelorette-party-budget-guide"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Guide</span>
                        <p className="font-medium text-ink-900 mt-1">
                            The Ultimate Bachelorette Party Budget Guide
                        </p>
                    </Link>
                </div>
            </div>
        </article>
    );
}
