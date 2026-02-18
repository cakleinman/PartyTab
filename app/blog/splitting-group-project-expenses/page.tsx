import type { Metadata } from "next";
import Link from "next/link";

import { AuthorBio } from "@/app/components/AuthorBio";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "How to Split Group Project Expenses (School & Work) | PartyTab",
    description:
        "Working on a group project with shared costs? Here's how to fairly split expenses for supplies, software, printing, and meals without team drama.",
    keywords: [
        "group project expenses",
        "split project costs",
        "class project budget",
        "team project expenses",
        "split supplies cost students",
        "group assignment budget",
    ],
    openGraph: {
        type: "article",
        title: "How to Split Group Project Expenses",
        description: "Fair expense splitting for class and work projects.",
        url: "https://partytab.app/blog/splitting-group-project-expenses",
        images: OG_IMAGE,
    },
    twitter: {
        card: "summary_large_image",
        title: "How to Split Group Project Expenses",
        description: "Fair expense splitting for class and work projects.",
        images: TWITTER_IMAGE,
    },
    alternates: {
        canonical: "https://partytab.app/blog/splitting-group-project-expenses",
    },
};

export default function SplittingGroupProjectExpensesPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="How to Split Group Project Expenses (School & Work)"
                description="Working on a group project with shared costs? Here's how to fairly split expenses for supplies, software, printing, and meals without team drama."
                slug="splitting-group-project-expenses"
                datePublished="2026-01-18"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Group Project Expenses", url: "https://partytab.app/blog/splitting-group-project-expenses" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Group Project Expenses</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        TIPS
                    </span>
                    <span className="text-sm text-ink-400">January 18, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">5 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    How to Split Group Project Expenses Without the Drama
                </h1>
                <p className="text-xl text-ink-600">
                    Supplies, software, food—here&apos;s how to split costs fairly whether
                    you&apos;re in school or at work.
                </p>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    Group projects are stressful enough without adding money drama to
                    the mix. Whether you&apos;re building a class presentation, creating a
                    prototype, or collaborating on a work initiative, shared expenses
                    can get messy fast.
                </p>
                <p>
                    Here&apos;s how to handle project costs without anyone feeling ripped off
                    or resentful.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Common Group Project Expenses
                </h2>
                <p>
                    Before you can split costs, identify what needs splitting:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Physical supplies:</strong> Poster boards, materials, prototypes</li>
                    <li><strong>Software/tools:</strong> Stock photos, premium accounts, domain names</li>
                    <li><strong>Printing:</strong> Reports, handouts, large-format prints</li>
                    <li><strong>Food:</strong> Working sessions, presentations, meeting snacks</li>
                    <li><strong>Transportation:</strong> Getting to off-campus locations</li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Golden Rule: Log Everything
                </h2>
                <p>
                    The biggest mistake teams make: &quot;I&apos;ll just keep track in my head.&quot;
                    You won&apos;t. Neither will anyone else.
                </p>
                <p>
                    Start a shared expense log from day one. Every receipt, every
                    purchase—log it immediately with:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>What was purchased</li>
                    <li>How much it cost</li>
                    <li>Who paid</li>
                    <li>Who it&apos;s for (whole team or specific members)</li>
                </ul>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 Simple project expense tracking
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        PartyTab works great for group projects. Create a tab, share the
                        link in your group chat, and everyone can add expenses. No app
                        download—it runs in any browser.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        Create a project expense tab →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    How to Handle Different Contribution Levels
                </h2>
                <p>
                    Not everyone in a group project contributes equally (frustrating but
                    true). Should expense splits reflect effort?
                </p>
                <p>
                    <strong>Our recommendation:</strong> Split shared expenses evenly,
                    regardless of effort levels. Here&apos;s why:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        &quot;Effort&quot; is subjective and leads to arguments
                    </li>
                    <li>
                        Tying money to contribution creates weird incentives
                    </li>
                    <li>
                        The grade/outcome affects everyone equally anyway
                    </li>
                </ul>
                <p>
                    If someone genuinely freeloaded, handle that through the professor or
                    peer evaluation—not by shorting them $12 on supplies.
                </p>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Budget-Conscious Tips for Students
                </h2>
                <ul className="list-disc pl-6 space-y-3">
                    <li>
                        <strong>Check for free resources first.</strong> Your school likely
                        has free printing, software licenses (Adobe, Microsoft), and
                        sometimes supply grants.
                    </li>
                    <li>
                        <strong>Use free tools.</strong> Canva for design, Google Suite for
                        collaboration, free stock photo sites.
                    </li>
                    <li>
                        <strong>Buy only what you need.</strong> Don&apos;t over-purchase
                        supplies &quot;just in case.&quot;
                    </li>
                    <li>
                        <strong>Return unused items.</strong> Keep receipts and return what
                        you don&apos;t use.
                    </li>
                    <li>
                        <strong>Potluck study snacks.</strong> Everyone brings something
                        instead of one person buying.
                    </li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    For Work Projects: Who Actually Pays?
                </h2>
                <p>
                    Work projects are different. Many expenses should be reimbursed by
                    your employer, not split among teammates.
                </p>
                <p>
                    <strong>Generally reimbursable:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Software and tools for the project</li>
                    <li>Supplies and materials</li>
                    <li>Client meeting meals</li>
                    <li>Travel for project work</li>
                </ul>
                <p>
                    <strong>Often personal/split:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Team lunch (not client-facing)</li>
                    <li>Coffee runs</li>
                    <li>Celebration drinks after delivery</li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">💡 Pro tip</p>
                    <p className="text-amber-700 text-sm">
                        Always check your company&apos;s expense policy before assuming you&apos;ll
                        be reimbursed. Submit receipts promptly—it gets awkward when
                        someone is out $200 waiting for approval.
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    When Someone Can&apos;t Afford to Contribute
                </h2>
                <p>
                    In student groups especially, not everyone has the same budget.
                    Handle this with discretion:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        Ask privately if they&apos;re comfortable with the expected costs
                    </li>
                    <li>
                        Look for free alternatives (school supply rooms, free software)
                    </li>
                    <li>
                        Others can quietly cover their portion if needed—don&apos;t make it
                        a public thing
                    </li>
                </ul>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Settle Up Quickly
                </h2>
                <p>
                    Don&apos;t wait until the end of the semester to reconcile. Settle after
                    each major expense or at least weekly.
                </p>
                <p>
                    Why? People forget, graduate, change jobs, or just become hard to
                    reach. The longer you wait, the less likely you&apos;ll collect.
                </p>
            </div>


            <div className="mt-12 mb-8">
                <AuthorBio />
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Working on a group project?
                    </h3>
                    <p className="text-ink-300 mb-6">
                        Log expenses, split costs, graduate without money drama.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Start a Project Tab →
                    </Link>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/blog/splitting-group-dinner-bills"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Tips</span>
                        <p className="font-medium text-ink-900 mt-1">
                            How to Split a Group Dinner Bill Without the Awkwardness
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
        </article>
    );
}
