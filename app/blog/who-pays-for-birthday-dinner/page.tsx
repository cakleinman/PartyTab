import type { Metadata } from "next";
import Link from "next/link";

import { AuthorBio } from "@/app/components/AuthorBio";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Splitting a Birthday Dinner: Should the Birthday Person Pay? | PartyTab",
  description:
    "The check arrives. It's your friend's birthday. Who pays? The answer depends on one thing: who planned it. Here's the etiquette guide for birthday dinners.",
  keywords: [
    "who pays birthday dinner",
    "split birthday dinner bill",
    "birthday dinner etiquette",
    "should birthday person pay",
    "birthday dinner bill splitting",
    "how to split birthday check",
    "birthday meal etiquette rules",
    "who pays birthday celebration",
  ],
  openGraph: {
    type: "article",
    title: "Splitting a Birthday Dinner: Should the Birthday Person Pay?",
    description:
      "The check arrives. It's your friend's birthday. Who pays? The answer depends on one thing: who planned it. Here's the etiquette guide for birthday dinners.",
    url: "https://partytab.app/blog/who-pays-for-birthday-dinner",
    images: OG_IMAGE,
  },
  twitter: {
    card: "summary_large_image",
    title: "Splitting a Birthday Dinner: Should the Birthday Person Pay?",
    description:
      "The check arrives. It's your friend's birthday. Who pays? The answer depends on one thing: who planned it. Here's the etiquette guide for birthday dinners.",
    images: TWITTER_IMAGE,
  },
  alternates: {
    canonical: "https://partytab.app/blog/who-pays-for-birthday-dinner",
  },
};

export default function WhoPaysBirthdayDinnerPage() {
  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="Splitting a Birthday Dinner: Should the Birthday Person Pay?"
                description="The check arrives. It's your friend's birthday. Who pays? The answer depends on one thing: who planned it. Here's the etiquette guide for birthday dinners."
                slug="who-pays-for-birthday-dinner"
                datePublished="2026-06-04"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "Who Pays for a Birthday Dinner?", url: "https://partytab.app/blog/who-pays-for-birthday-dinner" },
                ]}
            />

      {/* Breadcrumb */}
      <nav className="text-sm text-ink-500 mb-8">
        <Link href="/" className="hover:text-ink-700">
          Home
        </Link>
        {" → "}
        <Link href="/blog" className="hover:text-ink-700">
          Blog
        </Link>
        {" → "}
        <span className="text-ink-900">Who Pays for a Birthday Dinner?</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
            ADVICE
          </span>
          <time className="text-sm text-ink-400" dateTime="2026-06-04">
            June 4, 2026
          </time>
          <span className="text-sm text-ink-400">• 5 min read</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
          Splitting a Birthday Dinner: Should the Birthday Person Pay?
        </h1>
        <p className="text-xl text-ink-600">
          The check comes. It&apos;s your friend&apos;s birthday. Who pays? The answer
          depends on one thing: who planned it.
        </p>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <p>
          You&apos;re at a restaurant celebrating your best friend&apos;s birthday. Dinner
          was amazing. The cake just arrived. Everyone sang. Now the server places the check
          on the table.
        </p>

        <p>
          Suddenly, the mood shifts. Does the birthday person pay? Do you split it evenly
          including them? Do the guests cover everything? And if you&apos;re splitting, how
          do you calculate their share?
        </p>

        <p>
          Good news: etiquette experts have a clear answer. And it&apos;s simpler than you
          think.
        </p>

        <h2 id="simple-rule" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          The Simple Rule: Who Invited Whom?
        </h2>

        <p>
          According to the Emily Post Institute — the gold standard for American
          etiquette — the rule for birthday dinners is straightforward:
        </p>

        <p>
          <strong>
            If you organize the dinner, you&apos;re the host. If you&apos;re the host, you
            pay.
          </strong>
        </p>

        <p>But there are two scenarios:</p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Scenario 1: You Organized a Surprise or Invited People to Celebrate Someone
        </h3>
        <p>
          <strong>You pay.</strong> Or, more commonly, you and the other guests split the
          birthday person&apos;s portion. The birthday person eats free.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Scenario 2: The Birthday Person Invited Everyone
        </h3>
        <p>
          <strong>They pay.</strong> If someone invites you to their own birthday dinner at
          a restaurant they chose, traditional etiquette says they&apos;re hosting — which
          means they cover the bill.
        </p>

        <p>
          In modern practice, though, most people don&apos;t expect the birthday person to
          pay when they invite you. The unspoken understanding is usually: &quot;Join me for
          my birthday — we&apos;ll all pay our own way.&quot;
        </p>

        <p>
          Lizzie Post (co-president of the Emily Post Institute) advises:{" "}
          <em>
            &quot;If you&apos;re unclear, ask beforehand. A simple &apos;Are we splitting
            this, or is it hosted?&apos; clears up confusion.&quot;
          </em>
        </p>

        <h2 id="splitting-share" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          How to Split the Birthday Person&apos;s Share
        </h2>

        <p>
          Let&apos;s say you&apos;re celebrating your friend&apos;s birthday. There are 6
          people total (including the birthday person). The check is $240.
        </p>

        <p>
          <strong>Wrong way:</strong> Divide $240 by 6 people = $40 each (including the
          birthday person).
        </p>

        <p>
          That defeats the purpose of treating them. They shouldn&apos;t pay for their own
          birthday dinner.
        </p>

        <p>
          <strong>Right way:</strong> Subtract the birthday person&apos;s meal from the
          total first.
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Total bill: $240</li>
          <li>Birthday person&apos;s meal: $40</li>
          <li>Remaining balance: $200</li>
          <li>Divide $200 by 5 guests = $40 each</li>
          <li>
            Then split the birthday person&apos;s $40 meal among the 5 guests = $8 each
          </li>
          <li>
            <strong>Each guest pays: $40 (their meal) + $8 (their share of the birthday
            person&apos;s meal) = $48</strong>
          </li>
        </ul>

        <p>The birthday person pays $0.</p>

        <p>
          Or, even simpler: exclude the birthday person from the split entirely. If
          you&apos;re using an app like PartyTab, just don&apos;t assign them any items.
          Everyone else claims their own meal, and the birthday person&apos;s items get
          distributed automatically among the rest of the group.
        </p>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
          <h4 className="font-semibold text-teal-900 mb-2">
            Birthday Splits Made Simple
          </h4>
          <p className="text-teal-800 text-sm mb-4">
            PartyTab makes birthday dinners easy. Scan the receipt, add everyone except the
            birthday person as participants, and the app automatically splits their meal
            among the guests. No manual math. No awkward conversations.
          </p>
          <Link
            href="/tabs/new"
            className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Try PartyTab Free
          </Link>
        </div>

        <h2 id="communicate" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          Communicate BEFORE the Dinner
        </h2>

        <p>
          The #1 cause of birthday dinner awkwardness is unclear expectations. Avoid this by
          sending a message before the dinner:
        </p>

        <p>
          <strong>Good example:</strong>
        </p>
        <blockquote className="border-l-4 border-ink-200 pl-4 italic text-ink-700">
          &quot;We&apos;re celebrating Sarah&apos;s birthday at Osteria on Friday at 7 PM!
          Plan to cover your meal plus a share of Sarah&apos;s. The restaurant is
          mid-range Italian — budget roughly $50-60 per person including tip. Let me know if
          you can make it!&quot;
        </blockquote>

        <p>This message tells people:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Where and when</li>
          <li>That they&apos;re expected to chip in for the birthday person</li>
          <li>Roughly how much to budget</li>
        </ul>

        <p>
          No surprises. No one shows up thinking the meal is hosted, then gets hit with a
          $75 bill they weren&apos;t expecting.
        </p>

        <h2 id="budget-alternatives" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          Budget-Friendly Birthday Alternatives
        </h2>

        <p>
          If you want to celebrate a birthday but can&apos;t afford a pricey restaurant,
          there are plenty of alternatives:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Brunch instead of dinner.</strong> Same celebration vibe, 30-50%
            cheaper.
          </li>
          <li>
            <strong>Potluck gathering.</strong> Everyone brings a dish. The birthday person
            brings nothing.
          </li>
          <li>
            <strong>Home-cooked dinner.</strong> One or two people cook, everyone else
            brings drinks or dessert.
          </li>
          <li>
            <strong>Dessert-only celebration.</strong> Meet at a bakery or ice cream shop.
            Much cheaper than a full meal, still festive.
          </li>
          <li>
            <strong>Picnic in the park.</strong> Everyone chips in $10-15 for food from a
            grocery store or deli.
          </li>
        </ul>

        <p>
          The point of a birthday celebration is the people, not the price tag. A $15
          brunch with good friends beats a $200 dinner where half the guests are silently
          resenting the bill.
        </p>

        <h2 id="awkward-scenarios" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          The Awkward Scenarios (And How to Handle Them)
        </h2>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          What if the birthday person picks an expensive restaurant?
        </h3>
        <p>
          If you&apos;re organizing and the birthday person requests a $200/head steakhouse,
          you have two options:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Politely suggest a more budget-friendly alternative: &quot;I love that place,
            but I want to make sure everyone can come. How about [mid-range option]
            instead?&quot;
          </li>
          <li>
            Go to the expensive place, but make the budget expectations crystal clear
            upfront: &quot;Heads up — this restaurant is pricey. Budget $150-200/person
            including drinks and tip. Let me know if that works for you.&quot;
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          What if you can&apos;t afford to attend?
        </h3>
        <p>
          It&apos;s 100% okay to decline if the budget doesn&apos;t work for you. Be
          honest:
        </p>
        <blockquote className="border-l-4 border-ink-200 pl-4 italic text-ink-700">
          &quot;I&apos;d love to celebrate with you, but I can&apos;t swing the budget for
          that restaurant right now. Can we grab coffee or brunch another time?&quot;
        </blockquote>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          What if someone at the table doesn&apos;t want to chip in?
        </h3>
        <p>
          If someone shows up to a birthday dinner and then refuses to help cover the
          birthday person&apos;s share, that&apos;s a breach of etiquette — not yours.
        </p>
        <p>
          You can either absorb their share among the remaining guests, or the organizer can
          pull them aside privately: &quot;Hey, we discussed beforehand that we&apos;d cover
          [name]&apos;s meal. Your share is $X.&quot;
        </p>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
          <p className="text-amber-800 font-medium mb-1">
            💡 If You&apos;re the Birthday Person
          </p>
          <p className="text-amber-700 text-sm">
            If you&apos;re the birthday person and you pick the restaurant, keep your
            friends&apos; budgets in mind. Picking a $200/head steakhouse and expecting 10
            friends to cover you is a big ask. Choose somewhere mid-range, or offer to cover
            part of your own meal if you really want the fancy spot.
          </p>
        </div>

        <h2 id="final-advice" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          Final Advice: It&apos;s About the Gesture, Not the Amount
        </h2>

        <p>
          Birthday dinners aren&apos;t about the size of the bill. They&apos;re about taking
          a moment to celebrate someone you care about.
        </p>

        <p>
          Whether it&apos;s a $15 brunch or a $200 tasting menu, the key is clear
          communication. Tell people upfront what the plan is. Set budget expectations. And
          make sure the birthday person doesn&apos;t have to worry about the bill.
        </p>

        <p>
          If you&apos;re organizing, use a tool like PartyTab to make the splitting
          painless. Scan the receipt, exclude the birthday person from the split, and
          everyone pays their fair share in seconds.
        </p>

        <p>
          <strong>Bottom line:</strong> If you organized it, the guests split the birthday
          person&apos;s meal. If the birthday person organized it, clarify expectations
          beforehand. And no matter what, don&apos;t let bill anxiety ruin what should be a
          joyful celebration.
        </p>
      </div>


      <div className="mt-12 mb-8">
          <AuthorBio />
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 pt-8 border-t border-sand-200">
        <div className="bg-ink-900 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-sand-50 mb-2">
            Planning a Birthday Dinner?
          </h3>
          <p className="text-ink-300 mb-6">
            PartyTab makes birthday splits effortless. Add an expense, exclude the birthday
            person from the split, and everyone else covers their share automatically. No
            math, no awkwardness.
          </p>
          <Link
            href="/tabs/new"
            className="inline-block bg-teal-500 text-ink-900 px-6 py-3 rounded-xl font-semibold hover:bg-teal-400 transition-colors"
          >
            Start a Tab — Free Forever
          </Link>
          <p className="text-sm text-ink-400 mt-3">
            No credit card required. Works on any device.
          </p>
        </div>
      </div>

      {/* Related Posts */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-ink-900 mb-4">Related Articles</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/blog/large-group-dinner-bill-tips"
            className="block p-4 border border-sand-200 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-colors"
          >
            <h4 className="font-semibold text-ink-900 mb-1">
              Large Group Dinners: Bill Tips
            </h4>
            <p className="text-sm text-ink-600">
              How to handle the bill for 8+ people without post-dinner chaos.
            </p>
          </Link>
          <Link
            href="/blog/splitting-group-dinner-bills"
            className="block p-4 border border-sand-200 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-colors"
          >
            <h4 className="font-semibold text-ink-900 mb-1">
              7 Tips for Splitting Group Dinner Bills
            </h4>
            <p className="text-sm text-ink-600">
              Master the art of dividing the check with our complete guide.
            </p>
          </Link>
        </div>
      </div>
    </article>
  );
}
