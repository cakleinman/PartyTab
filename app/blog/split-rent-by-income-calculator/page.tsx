import type { Metadata } from "next";
import Link from "next/link";

import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
  title: "How to Split Rent Fairly Based on Income (With Calculator Logic) | PartyTab",
  description:
    "You make $80k. Your partner makes $50k. Splitting rent 50/50 isn&apos;t fair. Learn how to split rent proportionally based on income with step-by-step examples.",
  keywords: [
    "split rent based on income",
    "income based rent calculator",
    "proportional rent split",
    "fair rent split couple",
    "split bills by income ratio",
  ],
  openGraph: {
    title: "How to Split Rent Fairly Based on Income (With Calculator Logic)",
    description:
      "Learn how to split rent proportionally based on income — with step-by-step examples and real formulas.",
    url: "https://partytab.app/blog/split-rent-by-income-calculator",
  },
  alternates: {
    canonical: "https://partytab.app/blog/split-rent-by-income-calculator",
  },
};

export default function SplitRentByIncomeCalculatorPage() {
  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="How to Split Rent Fairly Based on Income (With Calculator Logic)"
                description="You make $80k. Your partner makes $50k. Splitting rent 50/50 isn&apos;t fair. Learn how to split rent proportionally based on income with step-by-step examples."
                slug="split-rent-by-income-calculator"
                datePublished="2026-03-26"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "How to Split Rent Fairly Based on Income", url: "https://partytab.app/blog/split-rent-by-income-calculator" },
                ]}
            />

      <nav className="text-sm text-ink-500 mb-8">
        <Link href="/" className="hover:text-teal-600">
          Home
        </Link>
        {" → "}
        <Link href="/blog" className="hover:text-teal-600">
          Blog
        </Link>
        {" → "}
        <span className="text-ink-900">
          How to Split Rent Fairly Based on Income
        </span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
            GUIDE
          </span>
          <time dateTime="2026-03-26" className="text-sm text-ink-400">
            March 26, 2026 · 8 min read
          </time>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
          How to Split Rent Fairly Based on Income (With Calculator Logic)
        </h1>
        <p className="text-xl text-ink-600">
          You make $80k. Your partner makes $50k. Splitting rent 50/50 means
          they&apos;re spending a much larger percentage of their income.
          Here&apos;s how to make it fair.
        </p>
      </header>

      <div className="prose prose-lg max-w-none">
        <p>
          Picture this: You and your partner move in together. You make $80,000
          a year. They make $50,000. Your rent is $2,000 a month. You decide to
          split it 50/50 — $1,000 each. Fair, right?
        </p>

        <p>
          Not exactly. That $1,000 represents 15% of your monthly income, but
          21% of theirs. After rent, you&apos;ve got $5,667 left to spend.
          They&apos;ve got $3,167. The gap widens every month.
        </p>

        <p>
          This is where income-based rent splitting comes in. It&apos;s not
          about charity or power dynamics — it&apos;s about both people having
          a similar quality of life after expenses.
        </p>

        <h2 id="why-not-5050" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          Why 50/50 Isn&apos;t Always Fair
        </h2>

        <p>
          A 50/50 split assumes both people have equal financial capacity. But
          if one person earns 60% of the total household income, they can
          afford to shoulder more of the rent — and often should.
        </p>

        <p>Here&apos;s what happens when you force a 50/50 split:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            The lower earner may struggle to save or enjoy discretionary
            spending
          </li>
          <li>
            The higher earner has excess disposable income while their partner
            is stretched thin
          </li>
          <li>
            Resentment builds — one person feels financially squeezed, the
            other feels guilty
          </li>
          <li>
            The lower earner may compromise on housing quality to afford their
            half
          </li>
        </ul>

        <p>
          Income-based splitting creates balance. Both people contribute
          proportionally to their earnings, and both have similar financial
          breathing room after rent.
        </p>

        <h2 id="income-method" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          The Income-Based Method (Step by Step)
        </h2>

        <p>
          The income-based method is simple: each person pays a percentage of
          the rent equal to their percentage of total household income.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Step 1: Add Your Total Income
        </h3>

        <p>
          Start with annual or monthly income — whichever is easier. Let&apos;s
          use annual:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Person A: $80,000/year</li>
          <li>Person B: $50,000/year</li>
          <li>
            <strong>Total household income: $130,000</strong>
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Step 2: Calculate Each Person&apos;s Percentage
        </h3>

        <p>Divide each person&apos;s income by the total:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Person A: $80,000 ÷ $130,000 = 0.615 → 61.5%</li>
          <li>Person B: $50,000 ÷ $130,000 = 0.385 → 38.5%</li>
        </ul>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Step 3: Apply to Rent
        </h3>

        <p>
          Multiply each percentage by your total monthly rent. For $2,000/month
          rent:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Person A: $2,000 × 0.615 = $1,230</li>
          <li>Person B: $2,000 × 0.385 = $770</li>
        </ul>

        <p>
          Now Person A pays $1,230/month and Person B pays $770/month. Both are
          spending roughly 18.5% of their income on rent — a much fairer split.
        </p>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
          <p className="text-amber-800 font-medium mb-1">
            💡 This isn&apos;t about who earns more &quot;deserving&quot; to
            pay more
          </p>
          <p className="text-amber-700 text-sm">
            It&apos;s about both partners having a similar quality of life
            after expenses. If both people are spending the same percentage of
            their income on rent, both have similar financial flexibility for
            savings, hobbies, and emergencies.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Side-by-Side Comparison
        </h3>

        <div className="overflow-x-auto my-6">
          <table className="min-w-full border-collapse border border-ink-200">
            <thead>
              <tr className="bg-ink-50">
                <th className="border border-ink-200 px-4 py-2 text-left">
                  Method
                </th>
                <th className="border border-ink-200 px-4 py-2 text-left">
                  Person A ($80k)
                </th>
                <th className="border border-ink-200 px-4 py-2 text-left">
                  Person B ($50k)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-ink-200 px-4 py-2">50/50 Split</td>
                <td className="border border-ink-200 px-4 py-2">
                  $1,000 (15% of income)
                </td>
                <td className="border border-ink-200 px-4 py-2">
                  $1,000 (24% of income)
                </td>
              </tr>
              <tr className="bg-teal-50">
                <td className="border border-ink-200 px-4 py-2">
                  Income-Based
                </td>
                <td className="border border-ink-200 px-4 py-2">
                  $1,230 (18.5% of income)
                </td>
                <td className="border border-ink-200 px-4 py-2">
                  $770 (18.5% of income)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="other-methods" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          Other Methods to Consider
        </h2>

        <p>
          Income-based splitting is the most common approach for couples with
          income disparity, but it&apos;s not the only option. Here are a few
          alternatives:
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          1. Square Footage Method
        </h3>

        <p>
          If one person has a larger bedroom or private bathroom, they pay more
          based on the space they occupy. This works well for roommates or
          couples where income is similar but amenities differ.
        </p>

        <p>
          Example: A 2-bedroom apartment where one room is 200 sq ft and the
          other is 120 sq ft. Person A pays 62.5% of rent, Person B pays 37.5%.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          2. Hybrid Method
        </h3>

        <p>
          Split rent proportionally based on income, but split utilities 50/50.
          This balances fairness with simplicity — rent is the big expense
          where proportionality matters most.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          3. Proportional + Caps
        </h3>

        <p>
          Use income-based splitting, but cap each person&apos;s rent at 30% of
          their gross income. If the math pushes someone over that threshold,
          you may need a cheaper apartment or a higher-earning roommate.
        </p>

        <p>
          This prevents lifestyle inflation — just because one person earns
          more doesn&apos;t mean they should subsidize an apartment that&apos;s
          out of reach for the household as a whole.
        </p>

        <h2 id="conversation" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          The Conversation Template
        </h2>

        <p>
          Bringing up income-based rent splitting can feel awkward, especially
          if you&apos;re the higher earner. Here&apos;s a script to make it
          easier:
        </p>

        <blockquote className="border-l-4 border-teal-400 pl-4 italic text-ink-700 my-6">
          &quot;I&apos;ve been thinking about how we split rent. Right now
          we&apos;re doing 50/50, which is simple, but I want to make sure it
          feels fair for both of us. Since I earn more, I can afford to
          contribute a bit more — and I think that would give us both more
          financial breathing room. What do you think about splitting it
          proportionally based on our incomes?&quot;
        </blockquote>

        <p>Key points to emphasize:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            This is about fairness and quality of life, not generosity or power
          </li>
          <li>Both people benefit from proportional splitting</li>
          <li>It&apos;s not permanent — you can revisit as incomes change</li>
        </ul>

        <h2 id="when-to-revisit" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          When to Revisit the Split
        </h2>

        <p>Income-based splitting isn&apos;t set-it-and-forget-it. Revisit your arrangement after:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>A raise or promotion:</strong> If one person&apos;s income
            jumps significantly, recalculate percentages
          </li>
          <li>
            <strong>A job change:</strong> New job, new salary — time to
            rebalance
          </li>
          <li>
            <strong>Lifestyle changes:</strong> Moving to a more expensive
            apartment, adding a pet, or taking on student loans
          </li>
          <li>
            <strong>Every 6-12 months:</strong> Even if nothing major changes,
            check in to make sure the split still feels fair
          </li>
        </ul>

        <p>
          Pro tip: Set a calendar reminder for &quot;rent split check-in&quot;
          every January. Make it a routine conversation, not a crisis
          negotiation.
        </p>

        <h2 id="shared-expenses" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          What Counts as &quot;Shared&quot; Expenses?
        </h2>

        <p>
          Once you&apos;re splitting rent proportionally, you&apos;ll probably
          want to apply the same logic to other shared expenses. Here&apos;s a
          common framework:
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Split Proportionally
        </h3>

        <ul className="list-disc pl-6 space-y-2">
          <li>Rent</li>
          <li>Utilities (electricity, gas, water)</li>
          <li>Internet and streaming services</li>
          <li>Groceries (if you shop together)</li>
          <li>Shared household items (cleaning supplies, furniture)</li>
        </ul>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Keep Individual
        </h3>

        <ul className="list-disc pl-6 space-y-2">
          <li>Car payments and insurance</li>
          <li>Student loans</li>
          <li>Personal subscriptions (gym, Spotify, apps)</li>
          <li>Clothing and personal care</li>
          <li>Dining out (unless it&apos;s a shared celebration)</li>
        </ul>

        <p>
          The line between &quot;shared&quot; and &quot;individual&quot; varies
          by couple. Some split everything. Some only split fixed housing
          costs. The key is to decide together and be consistent.
        </p>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
          <h4 className="font-semibold text-teal-900 mb-2">
            PartyTab handles custom splits for roommates and couples
          </h4>
          <p className="text-teal-800 text-sm mb-4">
            Track shared expenses, set custom split percentages (like 62/38),
            and settle up monthly — no spreadsheets, no awkward Venmo requests.
          </p>
          <Link
            href="/tabs/new"
            className="inline-block bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition"
          >
            Try PartyTab Free
          </Link>
        </div>

        <h2 id="final-thoughts" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          Final Thoughts
        </h2>

        <p>
          Splitting rent by income isn&apos;t about one person being more
          generous or the other being more dependent. It&apos;s about building
          a partnership where both people have financial stability and
          breathing room.
        </p>

        <p>
          The math is simple. The conversation might feel awkward at first. But
          once you&apos;ve set it up, it fades into the background — and
          you&apos;ll both have more money to spend on the things that actually
          matter.
        </p>

        <div className="bg-ink-900 rounded-3xl p-8 text-center my-12">
          <h3 className="text-2xl font-bold text-white mb-3">
            Living with a partner? Split expenses fairly.
          </h3>
          <p className="text-ink-300 mb-6 max-w-xl mx-auto">
            PartyTab makes it easy to track shared costs and split them
            proportionally — whether it&apos;s 50/50 or 62/38.
          </p>
          <Link
            href="/tabs/new"
            className="inline-block bg-teal-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-teal-400 transition mb-4"
          >
            Create Your First Tab
          </Link>
          <p className="text-ink-400 text-sm">
            Free. No app download needed.
          </p>
        </div>

        <div className="border-t border-ink-200 pt-8 mt-12">
          <h3 className="text-lg font-semibold text-ink-900 mb-4">
            Related Articles
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/blog/splitting-rent-fairly"
              className="block p-4 border border-ink-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition"
            >
              <div className="text-xs font-semibold text-teal-600 mb-1">
                TIPS
              </div>
              <div className="font-semibold text-ink-900 mb-1">
                How to Split Rent Fairly with Roommates
              </div>
              <div className="text-sm text-ink-600">
                5 proven methods to avoid roommate resentment over rent.
              </div>
            </Link>
            <Link
              href="/blog/splitting-groceries-with-roommates"
              className="block p-4 border border-ink-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition"
            >
              <div className="text-xs font-semibold text-teal-600 mb-1">
                GUIDE
              </div>
              <div className="font-semibold text-ink-900 mb-1">
                Splitting Grocery Bills with Roommates: A Survival Guide
              </div>
              <div className="text-sm text-ink-600">
                Hybrid systems, tracking tips, and how to handle the roommate
                who eats everything.
              </div>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
