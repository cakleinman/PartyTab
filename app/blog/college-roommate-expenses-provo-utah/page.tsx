import type { Metadata } from "next";
import Link from "next/link";

import { AuthorBio } from "@/app/components/AuthorBio";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "The BYU & UVU Student's Guide to Splitting Roommate Expenses in Provo | PartyTab",
    description:
        "Real Provo prices, cleaning check fines, WinCo grocery runs, and utility splitting for BYU and UVU students. A practical guide to managing shared expenses in college apartments.",
    keywords: [
        "BYU roommate expenses",
        "UVU roommate bills",
        "Provo apartment expenses",
        "college roommate expense splitting",
        "split rent BYU",
        "cleaning check fines Provo",
        "Provo Utah student housing costs",
    ],
    openGraph: {
        title: "The BYU & UVU Student's Guide to Splitting Roommate Expenses in Provo",
        description:
            "Real Provo prices, cleaning checks, and grocery runs. A practical guide for college apartment expenses.",
        url: "https://partytab.app/blog/college-roommate-expenses-provo-utah",
    },
    alternates: {
        canonical: "https://partytab.app/blog/college-roommate-expenses-provo-utah",
    },
};

export default function CollegeRoommateExpensesProvoPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="The BYU & UVU Student's Guide to Splitting Roommate Expenses in Provo"
                description="Real Provo prices, cleaning check fines, WinCo grocery runs, and utility splitting for BYU and UVU students."
                slug="college-roommate-expenses-provo-utah"
                datePublished="2026-03-05"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "College Roommate Expenses Provo", url: "https://partytab.app/blog/college-roommate-expenses-provo-utah" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">College Roommate Expenses Provo</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        GUIDES
                    </span>
                    <span className="text-sm text-ink-400">March 5, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">8 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    The BYU &amp; UVU Student&apos;s Guide to Splitting Roommate
                    Expenses in Provo
                </h1>
                <p className="text-xl text-ink-600">
                    Real prices, real problems, and a system that actually works for
                    4-6 person apartments on semester leases.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    If you&apos;re a BYU or UVU student living in Provo or Orem, you
                    already know the drill: find an apartment, sign a semester contract,
                    and squeeze into a 4-6 person setup where you might be sharing a
                    bedroom with someone you met on a Facebook housing group two weeks ago.
                </p>
                <p>
                    The rent is cheap compared to most college towns. The expense-splitting
                    headaches are not.
                </p>
                <p>
                    Between utilities from three different companies, grocery runs where
                    one person always buys for the apartment, and cleaning check fines
                    that hit everyone because one roommate didn&apos;t wipe down the
                    stovetop—keeping track of who owes what gets complicated fast.
                </p>
                <p>
                    Here&apos;s a practical guide to what your expenses actually look like
                    and how to split them without destroying your apartment&apos;s vibe.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    What Does a Provo/Orem Apartment Actually Cost?
                </h2>
                <p>
                    Here&apos;s what you&apos;re actually looking at per person per month
                    in 2026, based on typical BYU and UVU-area housing:
                </p>

                <div className="bg-white border border-sand-200 rounded-2xl p-6 my-6">
                    <h4 className="font-semibold text-ink-900 mb-4">Monthly Costs Per Person (Provo/Orem)</h4>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-sand-200">
                                <th className="text-left py-2">Expense</th>
                                <th className="text-right py-2">Range</th>
                                <th className="text-right py-2">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Rent</td>
                                <td className="text-right py-2">$450-950</td>
                                <td className="text-right py-2 text-ink-500">Shared room vs. private</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Electricity (Rocky Mountain Power)</td>
                                <td className="text-right py-2">$15-35</td>
                                <td className="text-right py-2 text-ink-500">Spikes in summer (AC)</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Gas (Dominion Energy)</td>
                                <td className="text-right py-2">$10-25</td>
                                <td className="text-right py-2 text-ink-500">Spikes in winter (heat)</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Internet</td>
                                <td className="text-right py-2">$10-15</td>
                                <td className="text-right py-2 text-ink-500">Split one plan 4-6 ways</td>
                            </tr>
                            <tr className="border-b border-sand-100">
                                <td className="py-2">Groceries (shared)</td>
                                <td className="text-right py-2">$150-250</td>
                                <td className="text-right py-2 text-ink-500">WinCo, Smith&apos;s, Costco</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-semibold">Total</td>
                                <td className="text-right py-2 font-semibold">$635-1,275</td>
                                <td className="text-right py-2 text-ink-500"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    The tricky part isn&apos;t the amounts—it&apos;s that utilities come
                    from three different companies (Rocky Mountain Power for electric,
                    Dominion Energy for gas, and whichever internet provider your apartment
                    complex uses), rent is usually paid by one person who collects from
                    everyone, and groceries are a mix of shared and personal.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Cleaning Check Problem
                </h2>
                <p>
                    If you&apos;ve lived in BYU-approved or other managed housing in
                    Provo, you know about cleaning checks. Your apartment gets inspected
                    regularly, and if it fails, the whole unit gets fined—usually $25-50.
                </p>
                <p>
                    The problem: it&apos;s almost never everyone&apos;s fault. Maybe one
                    roommate left dishes in the sink or didn&apos;t vacuum their room.
                    But the fine hits the apartment, not the individual.
                </p>
                <p>
                    There are two fair ways to handle this:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Split evenly</strong> — if you all agreed on cleaning
                        responsibilities and someone slipped, everyone shares the
                        consequence as motivation to hold each other accountable.
                    </li>
                    <li>
                        <strong>Charge the responsible person</strong> — if it&apos;s
                        clearly one person&apos;s area that failed, log the fine to them.
                        PartyTab lets you assign expenses to specific roommates.
                    </li>
                </ul>
                <p>
                    Either way, log it. Don&apos;t let it become a passive-aggressive
                    note on the fridge.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Grocery Run Dilemma
                </h2>
                <p>
                    In most Provo apartments, one person ends up doing the big grocery
                    run. They drive to WinCo (because the prices are unbeatable) or
                    Smith&apos;s (because it&apos;s closer), buy a cart full of shared
                    staples—bread, eggs, milk, chicken, rice—and then Venmo-request
                    everyone individually.
                </p>
                <p>
                    This breaks down for three reasons:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Some items are personal (your protein powder, their energy drinks)</li>
                    <li>Not everyone eats the same things (dietary restrictions, preferences)</li>
                    <li>The person doing the shopping never tracks their own share</li>
                </ul>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        A better approach
                    </h4>
                    <p className="text-teal-800 text-sm mb-3">
                        Log the grocery trip as one expense on PartyTab, split among
                        everyone who shares the groceries. For mixed carts with personal
                        items, Pro subscribers can snap a photo of the receipt and let
                        each roommate claim their own items—shared staples get split
                        evenly, personal stuff gets charged to the buyer.
                    </p>
                    <Link
                        href="/use-cases/college-roommates"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        See how it works →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Utilities: Three Bills, One Apartment
                </h2>
                <p>
                    Provo/Orem apartments typically have separate bills for electricity
                    (Rocky Mountain Power), natural gas (Dominion Energy), and internet.
                    Some apartment complexes bundle water and trash into rent; others
                    don&apos;t.
                </p>
                <p>
                    The simplest approach: one roommate puts their name on each utility
                    account, screenshots the bill when it arrives, and logs the total in
                    PartyTab split evenly. This takes about 30 seconds per bill.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">Watch your winter gas bill</p>
                    <p className="text-amber-700 text-sm">
                        Dominion Energy bills can jump from $30/month in summer to $80-120
                        in winter when the heater is running. Set expectations early so
                        nobody is shocked when the December bill arrives.
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    What Happens When Someone Sells Their Contract?
                </h2>
                <p>
                    This is uniquely a Provo thing. Semester contracts mean roommates come
                    and go. When someone sells their contract and moves out mid-semester,
                    you need a clean financial break.
                </p>
                <p>
                    Here&apos;s the move:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>
                        Open your PartyTab and hit &ldquo;Settle Up&rdquo; — it calculates
                        exactly who owes what as of right now.
                    </li>
                    <li>
                        The leaving roommate pays or collects their balance.
                    </li>
                    <li>
                        Close the current tab and start a new one with the replacement
                        roommate. Clean slate.
                    </li>
                </ol>
                <p>
                    No more &ldquo;I think Tyler still owed me $15 from two months ago&rdquo;
                    situations. Everything is documented.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    5 Tips for Provo/Orem College Apartments
                </h2>
                <ol className="list-decimal pl-6 space-y-3">
                    <li>
                        <strong>Settle before finals week.</strong> Nobody wants to deal
                        with expense math during finals. Set a recurring reminder to settle
                        up the first week of each month.
                    </li>
                    <li>
                        <strong>Screenshot utility bills.</strong> Rocky Mountain Power and
                        Dominion Energy both have online portals. Screenshot the total and
                        log it immediately so you don&apos;t forget.
                    </li>
                    <li>
                        <strong>Agree on shared vs. personal groceries upfront.</strong>{" "}
                        Bread, eggs, and milk are shared. Your specific brand of almond
                        milk is personal. Have this conversation week one.
                    </li>
                    <li>
                        <strong>Don&apos;t float expenses for months.</strong> The longer
                        you wait to settle up, the harder it gets. Monthly is ideal.
                    </li>
                    <li>
                        <strong>Use one shared tracker, not group chat math.</strong> Scrolling
                        back through 200 iMessages to figure out who paid for what last month
                        is a nightmare. Use a tab.
                    </li>
                </ol>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Bottom Line
                </h2>
                <p>
                    Living with college roommates in Provo is one of the most affordable
                    housing situations you&apos;ll ever have. Don&apos;t let sloppy
                    expense tracking ruin it. Pick a system, log expenses as they happen,
                    and settle up monthly.
                </p>
                <p>
                    Your roommate relationships will thank you.
                </p>
            </div>

            <div className="mt-12 mb-8">
                <AuthorBio />
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Moving into a college apartment?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Start a tab, share the link with your roommates, and stop fighting
                        over who owes what.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Create a College Apartment Tab →
                    </Link>
                    <p className="text-sm text-ink-400 mt-3">Free. No app download needed.</p>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/use-cases/college-roommates"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Use Case</span>
                        <p className="font-medium text-ink-900 mt-1">
                            College Roommate Bill Splitting
                        </p>
                    </Link>
                    <Link
                        href="/blog/splitting-groceries-with-roommates"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Guide</span>
                        <p className="font-medium text-ink-900 mt-1">
                            Splitting Grocery Bills with Roommates
                        </p>
                    </Link>
                </div>
            </div>
        </article>
    );
}
