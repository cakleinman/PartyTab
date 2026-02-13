import type { Metadata } from "next";
import Link from "next/link";

import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "Dating and Money: Who Pays on the First Date in 2026? | PartyTab",
    description:
        "It's 2026 and we still can't agree on this one. Here's what the data says, what etiquette experts recommend, and how to handle it without making things weird.",
    keywords: [
        "who pays first date 2026",
        "splitting bill on date",
        "first date who should pay",
        "dating etiquette paying bill",
        "split check date",
    ],
    openGraph: {
        title: "Dating and Money: Who Pays on the First Date in 2026?",
        description:
            "What the data says and how to handle it without making things weird.",
        url: "https://partytab.app/blog/who-pays-on-first-date",
    },
    alternates: {
        canonical: "https://partytab.app/blog/who-pays-on-first-date",
    },
};

export default function WhoPaysOnFirstDatePage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="Dating and Money: Who Pays on the First Date in 2026?"
                description="It's 2026 and we still can't agree on this one. Here's what the data says, what etiquette experts recommend, and how to handle it without making things weird."
                slug="who-pays-on-first-date"
                datePublished="2026-05-07"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Who Pays on the First Date?", url: "https://partytab.app/blog/who-pays-on-first-date" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Who Pays on the First Date?</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        ADVICE
                    </span>
                    <span className="text-sm text-ink-400">May 7, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">6 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    Dating and Money: Who Pays on the First Date in 2026?
                </h1>
                <p className="text-xl text-ink-600">
                    It&apos;s 2026 and we still can&apos;t agree on this one. Here&apos;s what the data says, what etiquette experts recommend, and how to handle it without making things weird.
                </p>
            </header>

            {/* Table of Contents */}
            <div className="bg-sand-50 rounded-2xl p-6 mb-12">
                <h2 className="font-semibold text-ink-900 mb-3">In This Article</h2>
                <ul className="space-y-2 text-sm">
                    <li>
                        <a href="#data" className="text-teal-600 hover:underline">
                            What the Data Says
                        </a>
                    </li>
                    <li>
                        <a href="#asker-pays" className="text-teal-600 hover:underline">
                            The &quot;Asker Pays&quot; Rule
                        </a>
                    </li>
                    <li>
                        <a href="#arguments" className="text-teal-600 hover:underline">
                            Arguments for Each Approach
                        </a>
                    </li>
                    <li>
                        <a href="#lgbtq" className="text-teal-600 hover:underline">
                            LGBTQ+ Relationships
                        </a>
                    </li>
                    <li>
                        <a href="#long-term" className="text-teal-600 hover:underline">
                            As the Relationship Progresses
                        </a>
                    </li>
                    <li>
                        <a href="#handling-it" className="text-teal-600 hover:underline">
                            How to Handle It Gracefully
                        </a>
                    </li>
                </ul>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    The check arrives. You both glance at it. Someone reaches for their wallet. The other person says, &quot;I&apos;ve got it.&quot; The first person says, &quot;No, let me.&quot; And now you&apos;re in a weird politeness standoff that feels like it reveals something deeper about your compatibility.
                </p>
                <p>
                    Welcome to first-date finances in 2026. We&apos;ve agreed on a lot of things as a society, but who pays on the first date is not one of them.
                </p>
                <p>
                    Let&apos;s look at what people actually do, what the etiquette says, and how to navigate this moment without overthinking it.
                </p>

                <h2 id="data" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    What the Data Says
                </h2>
                <p>
                    The data reveals a massive generational and gender divide.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Who Actually Pays?
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>38% of people say split everything evenly</strong> on dates (Pew Research)
                    </li>
                    <li>
                        <strong>41% of millennials and Gen Z prefer splitting</strong> (higher than older generations)
                    </li>
                    <li>
                        <strong>80% of men think they should pay on the first date</strong> (Elite Singles)
                    </li>
                    <li>
                        <strong>Only 7% of people prefer splitting on a first date</strong> when asked about ideal scenarios (Elite Singles)
                    </li>
                </ul>

                <p>
                    Notice the contradiction? 38% say they split in practice, but only 7% say it&apos;s their preference. That gap tells you everything: people are splitting out of fairness or social pressure, not because it feels ideal.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    The Generational Shift
                </h3>
                <p>
                    Gen Z and millennials are shifting the norm toward splitting. Meanwhile, many men—especially older millennials and Gen X—still default to the expectation that they should pay.
                </p>
                <p>
                    This creates a lot of awkwardness. A 25-year-old woman might expect to split and feel uncomfortable if her date insists on paying. A 35-year-old man might feel like he&apos;s failing some unspoken test if he doesn&apos;t pick up the check.
                </p>
                <p>
                    There&apos;s no universal answer because we&apos;re in a transitional moment. The old rule (man pays) is fading. The new rule (split or alternate) isn&apos;t fully established. So everyone&apos;s improvising.
                </p>

                <h2 id="asker-pays" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The &quot;Asker Pays&quot; Rule
                </h2>
                <p>
                    Etiquette expert Emily Post offers the clearest guideline:
                </p>
                <p className="bg-sand-50 border-l-4 border-teal-500 pl-4 py-2">
                    <strong>Whoever initiates the date should be prepared to pay.</strong>
                </p>
                <p>
                    This rule works regardless of gender, sexual orientation, or income. If you asked someone out, you&apos;re the host. The host pays—or at least offers to.
                </p>
                <p>
                    That doesn&apos;t mean the other person can&apos;t offer to split or take turns paying on future dates. But it removes the ambiguity: the person who planned the outing takes financial responsibility by default.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Why This Rule Works
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>It&apos;s gender-neutral</li>
                    <li>It acknowledges that the person who chose the restaurant also chose the price point</li>
                    <li>It avoids assumptions about who &quot;should&quot; pay based on outdated norms</li>
                    <li>It gives both people a clear default to work from</li>
                </ul>

                <p>
                    If you asked someone to a $100 tasting menu, you shouldn&apos;t expect them to split it. If they suggested grabbing coffee, they should be ready to cover two lattes.
                </p>

                <h2 id="arguments" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Arguments for Each Approach
                </h2>
                <p>
                    Let&apos;s break down the three main approaches and the logic behind each.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    One Person Pays (Usually the Asker)
                </h3>
                <p><strong>Arguments for:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Shows generosity and investment in the date</li>
                    <li>Removes the awkward &quot;how do we split this?&quot; moment</li>
                    <li>Traditional gesture that many still appreciate</li>
                    <li>If you chose an expensive place, it&apos;s on you to cover it</li>
                </ul>
                <p><strong>Arguments against:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Can create an unspoken power dynamic or sense of obligation</li>
                    <li>May feel patronizing to some people</li>
                    <li>Can be financially stressful if you&apos;re dating frequently</li>
                </ul>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Split the Bill
                </h3>
                <p><strong>Arguments for:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Signals equality and removes any feeling of &quot;owing&quot; someone</li>
                    <li>Modern, straightforward, no ambiguity</li>
                    <li>Works well when both people suggested the date or plan to keep dating casually</li>
                </ul>
                <p><strong>Arguments against:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Can feel transactional or unromantic to some people</li>
                    <li>Adds a logistical moment that can kill the vibe</li>
                    <li>Doesn&apos;t account for income differences</li>
                </ul>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Alternating (First Date → Asker Pays, Second Date → Other Person Treats)
                </h3>
                <p><strong>Arguments for:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Builds reciprocity and shared investment over time</li>
                    <li>Removes the need to split every check</li>
                    <li>Feels generous without being one-sided</li>
                </ul>
                <p><strong>Arguments against:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Requires planning multiple dates, which isn&apos;t always realistic</li>
                    <li>Can lead to scorekeeping (&quot;I paid last time, so...&quot;)</li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">💡 The gesture matters more than the rule</p>
                    <p className="text-amber-700 text-sm">
                        The reach-for-your-wallet gesture isn&apos;t just performative. If you genuinely want to split, say so clearly. &quot;I&apos;d love to split this&quot; is more honest than a halfhearted wallet fumble. And if someone offers to pay, accept graciously—you can always get the next one.
                    </p>
                </div>

                <h2 id="lgbtq" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    LGBTQ+ Relationships
                </h2>
                <p>
                    For LGBTQ+ couples, there&apos;s no outdated gender-role precedent to default to—which can actually make things easier.
                </p>
                <p>
                    The &quot;asker pays&quot; rule works perfectly here. Whoever initiated the date covers it, or you discuss upfront how you want to handle it. Many same-sex couples default to splitting or alternating from the start, which removes the ambiguity entirely.
                </p>
                <p>
                    That said, there&apos;s also more freedom to be creative. Some couples split based on who earns more. Others use the &quot;I got dinner, you get drinks&quot; approach. The key is that there&apos;s no assumed norm, so you get to define what works for you.
                </p>

                <h2 id="long-term" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    As the Relationship Progresses
                </h2>
                <p>
                    The first date is one thing. But what about the fifth? The fifteenth? When you&apos;re six months in and living together?
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Early Dates (1-5)
                </h3>
                <p>
                    Stick with the &quot;asker pays&quot; or alternating rule. If you&apos;re both planning dates, you should both be covering some of them.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Established Relationship (Months In)
                </h3>
                <p>
                    At this point, you should be having explicit conversations about money. Some couples split everything 50/50. Others split proportionally based on income. Some keep finances entirely separate and just trade off who pays.
                </p>
                <p>
                    There&apos;s no right answer, but there is a wrong approach: assuming you&apos;re on the same page without ever discussing it.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Living Together / Shared Finances
                </h3>
                <p>
                    Once you&apos;re living together, the &quot;who pays for dates&quot; question becomes part of a larger financial conversation about rent, groceries, utilities, and shared goals.
                </p>
                <p>
                    At this stage, many couples open a joint account for shared expenses or use income-based splitting to keep things fair.
                </p>

                <h2 id="handling-it" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    How to Handle It Gracefully
                </h2>
                <p>
                    Here are practical scripts for navigating the check moment without making it weird.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    If You Want to Pay
                </h3>
                <blockquote className="border-l-4 border-sand-300 pl-4 italic text-ink-600 my-6">
                    &quot;I&apos;ve got this one. You can get the next one if we do this again.&quot;
                </blockquote>
                <p>
                    This covers the check, signals interest in a second date, and removes any sense of obligation.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    If You Want to Split
                </h3>
                <blockquote className="border-l-4 border-sand-300 pl-4 italic text-ink-600 my-6">
                    &quot;Want to just split this? That way we&apos;re even.&quot;
                </blockquote>
                <p>
                    Clear, direct, no ambiguity. Most people will appreciate the straightforwardness.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    If Someone Offers to Pay and You&apos;re Unsure
                </h3>
                <blockquote className="border-l-4 border-sand-300 pl-4 italic text-ink-600 my-6">
                    &quot;Are you sure? I&apos;m happy to split.&quot;
                </blockquote>
                <p>
                    This gives them an out if they were just being polite, or confirms their intent if they genuinely want to treat.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    If You&apos;re the One Being Treated
                </h3>
                <blockquote className="border-l-4 border-sand-300 pl-4 italic text-ink-600 my-6">
                    &quot;Thank you—I&apos;ll get the next one!&quot;
                </blockquote>
                <p>
                    Gracious acceptance that signals reciprocity.
                </p>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 PartyTab Isn&apos;t for First Dates
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        But once you&apos;re past the awkward early stages and living together, tracking shared expenses fairly becomes a real issue. PartyTab helps couples split rent, groceries, utilities, and shared costs without the mental load of tracking it all manually.
                    </p>
                    <Link
                        href="/blog/splitting-rent-fairly"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        Learn About Fair Rent Splitting →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Bottom Line
                </h2>
                <p>
                    Who pays on the first date in 2026? It depends.
                </p>
                <p>
                    The safest default: <strong>whoever asked should be prepared to pay, but graciously accept if the other person wants to split or alternate.</strong>
                </p>
                <p>
                    The worst thing you can do is avoid the conversation entirely and let resentment or confusion build. If you&apos;re unsure, just ask. A simple &quot;Want to split this?&quot; or &quot;I&apos;ve got this if you want to get the next one&quot; solves 90% of the awkwardness.
                </p>
                <p>
                    And remember: the check moment is not a test. It&apos;s just logistics. The person who handles it gracefully—whether by paying, offering to split, or accepting with thanks—is showing maturity, not passing or failing some unspoken exam.
                </p>
                <p>
                    Because the actual test isn&apos;t who pays for dinner. It&apos;s whether you can communicate about money without making it weird. And if you can do that on the first date, you&apos;re already ahead of most couples.
                </p>
            </div>

            {/* Author / CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Once you&apos;re past the first date—track shared expenses fairly
                    </h3>
                    <p className="text-ink-300 mb-6">
                        PartyTab helps couples and roommates split rent, utilities, groceries, and shared costs without the mental load. Create a tab, track expenses, settle up fairly.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start Tracking Shared Expenses →
                    </Link>
                    <p className="text-sm text-ink-400 mt-3">Free. No app download needed.</p>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/blog/splitting-rent-fairly"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Guide</span>
                        <p className="font-medium text-ink-900 mt-1">
                            How to Split Rent Fairly with Roommates
                        </p>
                    </Link>
                    <Link
                        href="/blog/is-it-rude-to-split-bill-evenly"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Advice</span>
                        <p className="font-medium text-ink-900 mt-1">
                            Is It Rude to Split the Bill Evenly?
                        </p>
                    </Link>
                </div>
            </div>
        </article>
    );
}
