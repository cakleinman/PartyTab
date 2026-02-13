import type { Metadata } from "next";
import Link from "next/link";

import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "36% of Friends Split Up Over Money: How to Proof Your Friendships | PartyTab",
    description:
        "Money is the fourth largest cause of friendship stress. Here's the data on how money destroys friendships—and how to prevent it from happening to you.",
    keywords: [
        "money ruining friendships statistics",
        "lost friendship over money",
        "friends and money don't mix",
        "money destroying friendships data",
        "financial incompatibility friends",
    ],
    openGraph: {
        title: "36% of Friends Split Up Over Money: How to Proof Your Friendships",
        description:
            "The data on how money destroys friendships—and how to prevent it.",
        url: "https://partytab.app/blog/money-ruining-friendships-statistics",
    },
    alternates: {
        canonical: "https://partytab.app/blog/money-ruining-friendships-statistics",
    },
};

export default function MoneyRuiningFriendshipsStatisticsPage() {
    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="36% of Friends Split Up Over Money: How to Proof Your Friendships"
                description="Money is the fourth largest cause of friendship stress. Here's the data on how money destroys friendships—and how to prevent it from happening to you."
                slug="money-ruining-friendships-statistics"
                datePublished="2026-04-02"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Money Ruining Friendships Statistics", url: "https://partytab.app/blog/money-ruining-friendships-statistics" },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/blog" className="hover:text-teal-600">Blog</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Money Ruining Friendships Statistics</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        ADVICE
                    </span>
                    <span className="text-sm text-ink-400">April 2, 2026</span>
                    <span className="text-sm text-ink-400">•</span>
                    <span className="text-sm text-ink-400">8 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
                    36% of Friends Split Up Over Money: How to Proof Your Friendships
                </h1>
                <p className="text-xl text-ink-600">
                    Money is the fourth largest cause of stress in friendships—after jealousy, gossip, and disagreements. And unlike the others, it&apos;s entirely preventable.
                </p>
            </header>

            {/* Table of Contents */}
            <div className="bg-sand-50 rounded-2xl p-6 mb-12">
                <h2 className="font-semibold text-ink-900 mb-3">In This Article</h2>
                <ul className="space-y-2 text-sm">
                    <li>
                        <a href="#statistics" className="text-teal-600 hover:underline">
                            The Numbers: How Money Destroys Friendships
                        </a>
                    </li>
                    <li>
                        <a href="#three-ways" className="text-teal-600 hover:underline">
                            The 3 Ways Money Kills Friendships
                        </a>
                    </li>
                    <li>
                        <a href="#why-bad" className="text-teal-600 hover:underline">
                            Why We&apos;re Bad at Talking About Money
                        </a>
                    </li>
                    <li>
                        <a href="#how-to-proof" className="text-teal-600 hover:underline">
                            How to &quot;Proof&quot; Your Friendships Against Money
                        </a>
                    </li>
                </ul>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <p>
                    You&apos;ve survived high school drama, college roommate conflicts, and the friend who insisted on going to every event on the group calendar. But statistically, the thing most likely to end your friendship isn&apos;t personality clashes or political arguments.
                </p>
                <p>
                    It&apos;s money.
                </p>
                <p>
                    And the worst part? Most of these friendship failures are completely avoidable. The data shows exactly how money ruins friendships—and more importantly, how to stop it before it happens to you.
                </p>

                <h2 id="statistics" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Numbers: How Money Destroys Friendships
                </h2>
                <p>
                    Let&apos;s start with the cold, hard facts. Multiple studies from the last two years paint a grim picture of how money affects friendships:
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Friendship Loss
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>36% of Americans have lost a friendship over money</strong> (LendingTree, 2025)
                    </li>
                    <li>
                        <strong>21% of adults have ended a friendship over money</strong> (Bread Financial, 2024)
                    </li>
                    <li>
                        <strong>77% would end a friendship over an unpaid $500 loan</strong> (Bank of America)
                    </li>
                    <li>
                        <strong>40% would end a friendship over an unpaid $100 loan</strong> (Bank of America)
                    </li>
                </ul>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Lending and Borrowing Gone Wrong
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>32% of people who lent money to friends never got it back</strong>
                    </li>
                    <li>
                        <strong>30% of borrowers never repaid the loan</strong>
                    </li>
                    <li>
                        <strong>40% of Americans have avoided a friend who owes them money</strong> rather than asking for it back
                    </li>
                </ul>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Spending Pressure and Incompatibility
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>74% of millennials break their budgets to socialize with friends</strong>
                    </li>
                    <li>
                        <strong>47% of Gen Z and millennials have considered ending friendships</strong> over incompatible spending habits
                    </li>
                    <li>
                        <strong>33% have lied about being in a better financial situation</strong> than they actually are
                    </li>
                </ul>

                <p>
                    Think about that last stat. One in three people you know has faked being financially comfortable to keep up with their friend group. That&apos;s not just financial stress—that&apos;s emotional labor that builds resentment over time.
                </p>

                <h2 id="three-ways" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The 3 Ways Money Kills Friendships
                </h2>
                <p>
                    The data shows three primary failure modes. If you can recognize them, you can avoid them.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    1. Lending and Borrowing (The Most Common)
                </h3>
                <p>
                    This is the big one. Someone needs money, you lend it, and suddenly the friendship dynamic shifts. You&apos;re no longer equals—you&apos;re creditor and debtor.
                </p>
                <p>
                    The stats are brutal: nearly one in three people who lend money to friends never get it back. And here&apos;s the kicker—40% of people <em>avoid the friend who owes them</em> rather than asking for repayment.
                </p>
                <p>
                    Avoidance is poison. You can&apos;t ghost someone slowly and expect the friendship to survive.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    2. Spending Pressure (Keeping Up Appearances)
                </h3>
                <p>
                    Your friend group wants to go to an expensive restaurant every week. You can&apos;t afford it, but you don&apos;t want to be the &quot;broke friend.&quot; So you go. And you break your budget. Again.
                </p>
                <p>
                    74% of millennials break their budgets to socialize. That&apos;s not generosity—that&apos;s financial self-harm driven by social pressure.
                </p>
                <p>
                    Eventually, you either burn out, build resentment, or quietly fade from the friend group. None of those outcomes preserve the friendship.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    3. Unequal Splitting (Subsidizing Someone Else&apos;s Habits)
                </h3>
                <p>
                    This is the slow killer. One friend always orders the most expensive thing on the menu, adds three cocktails, and then wants to split the bill evenly. You get stuck subsidizing their lobster while you had a salad.
                </p>
                <p>
                    It happens once, you let it go. It happens ten times, and you start declining invitations. The friendship doesn&apos;t explode—it just quietly dies from accumulated unfairness.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                    <p className="text-amber-800 font-medium mb-1">💡 The stat that should scare you</p>
                    <p className="text-amber-700 text-sm">
                        40% of Americans have AVOIDED a friend who owes them money rather than asking for it back. Avoidance kills friendships slowly. Once you start avoiding someone, the friendship is already over—you just haven&apos;t admitted it yet.
                    </p>
                </div>

                <h2 id="why-bad" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    Why We&apos;re Bad at Talking About Money
                </h2>
                <p>
                    If money problems in friendships are so predictable, why don&apos;t we just... talk about it?
                </p>
                <p>
                    Because money is one of the last true social taboos. We&apos;ll discuss politics, religion, and dating disasters before we&apos;ll admit we can&apos;t afford the group vacation.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    The Fear of Seeming Cheap
                </h3>
                <p>
                    No one wants to be the person who ruins the vibe by saying, &quot;Actually, that&apos;s out of my budget.&quot; So we say yes and stress about it later.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Income Insecurity
                </h3>
                <p>
                    Remember that 33% who lied about their financial situation? That&apos;s not dishonesty—that&apos;s shame. We tie financial stability to self-worth, and admitting you&apos;re struggling feels like admitting failure.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    Lack of Financial Literacy in Friendships
                </h3>
                <p>
                    We teach kids about sharing toys, not about splitting dinner bills. We have social scripts for breakups and job interviews, but not for &quot;Hey, you still owe me $200 from that trip six months ago.&quot;
                </p>
                <p>
                    The result? We avoid the conversation until it festers into resentment.
                </p>

                <h2 id="how-to-proof" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    How to &quot;Proof&quot; Your Friendships Against Money
                </h2>
                <p>
                    The good news: most money-related friendship failures are preventable. Here&apos;s how to protect your friendships from becoming another statistic.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    1. Split Expenses Instead of Lending
                </h3>
                <p>
                    If someone needs help covering a group expense, split it upfront rather than loaning money. Use an app to track who owes what. That way, it&apos;s a shared expense, not a debt.
                </p>
                <p>
                    The psychology matters: &quot;You owe me $100&quot; feels different than &quot;Your share of the Airbnb is $100.&quot; The first creates a power dynamic. The second is just logistics.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    2. Talk About Budget Upfront
                </h3>
                <p>
                    Before planning a trip, weekend getaway, or expensive group dinner, have the budget conversation early:
                </p>
                <blockquote className="border-l-4 border-sand-300 pl-4 italic text-ink-600 my-6">
                    &quot;Hey everyone, I&apos;m thinking we keep this trip around $300 per person. Does that work for everyone, or should we adjust?&quot;
                </blockquote>
                <p>
                    Give people permission to opt out or suggest alternatives without judgment. The friend who proposes a cheaper option isn&apos;t cheap—they&apos;re honest.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    3. Don&apos;t Pressure Friends Into Spending
                </h3>
                <p>
                    If someone declines an expensive plan, accept it without guilt-tripping. &quot;No worries, let&apos;s do something else soon&quot; is the correct response—not &quot;Come on, just this once!&quot;
                </p>
                <p>
                    That &quot;just this once&quot; is how 74% of millennials end up breaking their budgets.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    4. Use Tools That Remove the Emotional Labor
                </h3>
                <p>
                    The reason people avoid friends who owe them money is because asking feels uncomfortable. Remove the discomfort by using a shared expense tracker that does the reminding for you.
                </p>
                <p>
                    When the app sends the reminder, it&apos;s not you being petty—it&apos;s just logistics. This single shift prevents the avoidance spiral that kills 40% of lending-based friendships.
                </p>

                <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
                    5. If You Do Lend Money, Treat It as a Gift Mentally
                </h3>
                <p>
                    Financial advisors have been saying this forever: never lend money you can&apos;t afford to lose. If you decide to lend money to a friend, mentally categorize it as a gift. If they pay you back, great. If not, you won&apos;t resent them.
                </p>
                <p>
                    But honestly? Just don&apos;t lend money to friends. The stats show it doesn&apos;t end well.
                </p>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
                    <h4 className="font-semibold text-teal-900 mb-2">
                        📱 PartyTab Removes the Emotional Labor
                    </h4>
                    <p className="text-teal-800 text-sm mb-4">
                        Create a shared tab for any group expense. Everyone logs what they paid. The app calculates who owes who and sends gentle reminders—so you don&apos;t have to be the one asking. No apps to download, no accounts needed.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                        Create a Tab (Free) →
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">
                    The Bottom Line
                </h2>
                <p>
                    Money doesn&apos;t have to ruin friendships. The 36% who lost friends over money? Most of those failures came from avoidance, miscommunication, and the social taboo around discussing finances.
                </p>
                <p>
                    The solution isn&apos;t complicated:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Talk about money early and honestly</li>
                    <li>Split expenses instead of lending</li>
                    <li>Use tools that remove the emotional labor of tracking</li>
                    <li>Don&apos;t pressure friends into spending beyond their means</li>
                    <li>Accept budget differences without judgment</li>
                </ul>
                <p>
                    Your friendships are worth more than $100, $500, or even $5,000. Protect them by making money conversations normal, not taboo.
                </p>
            </div>

            {/* Author / CTA */}
            <div className="mt-16 pt-8 border-t border-sand-200">
                <div className="bg-ink-900 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-sand-50 mb-2">
                        Protect your friendships
                    </h3>
                    <p className="text-ink-300 mb-6">
                        PartyTab tracks group expenses so you don&apos;t have to chase people down for money. Create a tab, share the link, settle up fairly.
                    </p>
                    <Link
                        href="/tabs/new"
                        className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Create a Free Tab →
                    </Link>
                    <p className="text-sm text-ink-400 mt-3">No app download. No account required.</p>
                </div>
            </div>

            {/* Related Posts */}
            <div className="mt-12">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/blog/avoid-losing-friends-over-money"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Advice</span>
                        <p className="font-medium text-ink-900 mt-1">
                            How to Avoid Losing Friends Over Money
                        </p>
                    </Link>
                    <Link
                        href="/blog/remind-someone-owes-you-money"
                        className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
                    >
                        <span className="text-sm text-teal-600 font-medium">Tips</span>
                        <p className="font-medium text-ink-900 mt-1">
                            How to Remind Someone They Owe You Money
                        </p>
                    </Link>
                </div>
            </div>
        </article>
    );
}
