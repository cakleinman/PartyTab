import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Splitting Grocery Bills with Roommates: A Survival Guide | PartyTab",
  description:
    "Rent is easy to split. Groceries? That&apos;s where roommate tensions brew. Learn the hybrid system, tracking tips, and how to handle common flash points.",
  keywords: [
    "split groceries roommates",
    "share grocery bill fairly",
    "roommate grocery expenses",
    "how to split food costs roommates",
    "communal grocery shopping",
  ],
  openGraph: {
    title: "Splitting Grocery Bills with Roommates: A Survival Guide",
    description:
      "The hybrid system for splitting groceries with roommates — shared staples, individual items, and how to avoid resentment.",
    url: "https://partytab.app/blog/splitting-groceries-with-roommates",
  },
  alternates: {
    canonical: "https://partytab.app/blog/splitting-groceries-with-roommates",
  },
};

export default function SplittingGroceriesWithRoommatesPage() {
  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
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
          Splitting Grocery Bills with Roommates
        </span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
            GUIDE
          </span>
          <time dateTime="2026-04-23" className="text-sm text-ink-400">
            April 23, 2026 · 6 min read
          </time>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
          Splitting Grocery Bills with Roommates: A Survival Guide
        </h1>
        <p className="text-xl text-ink-600">
          Rent is easy to split — it&apos;s the same every month. Groceries?
          That&apos;s where roommate tensions brew. Someone eats all the
          snacks, someone goes organic, someone doesn&apos;t cook at all.
        </p>
      </header>

      <div className="prose prose-lg max-w-none">
        <p>
          You and your roommates sit down to split the bills. Rent: easy.
          Utilities: simple. Groceries? Suddenly everyone&apos;s doing mental
          math. &quot;Well, I didn&apos;t eat any of the chicken. But I did use
          the olive oil. Do condiments count? What about the organic
          milk?&quot;
        </p>

        <p>
          Grocery splitting is where most roommate conflicts start — not
          because anyone&apos;s trying to be unfair, but because food is
          personal, consumption varies, and receipts are messy.
        </p>

        <p>
          This guide covers three common approaches, explains the hybrid system
          that works for most households, and walks through how to handle the
          inevitable flash points.
        </p>

        <h2 id="approaches" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          3 Common Approaches
        </h2>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          1. Fully Separate (Everyone Buys Their Own)
        </h3>

        <p>
          Each person shops for themselves, buys their own groceries, and keeps
          them in designated fridge shelves or labeled containers.
        </p>

        <p>
          <strong>Pros:</strong> Zero confusion. No resentment. Crystal-clear
          ownership.
        </p>

        <p>
          <strong>Cons:</strong> Wasteful (4 bottles of ketchup in one fridge),
          lonely (no communal cooking), and annoying (someone&apos;s always out
          of something and eyeing your shelf).
        </p>

        <p>
          <strong>Best for:</strong> Roommates with very different diets,
          schedules, or trust issues.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          2. Fully Shared (Split Everything Evenly)
        </h3>

        <p>
          Everything goes into one communal pool. All groceries are shared. The
          bill gets split evenly at the end of each month.
        </p>

        <p>
          <strong>Pros:</strong> Simple. Communal. Feels like a real household.
        </p>

        <p>
          <strong>Cons:</strong> Breeds resentment if one person eats twice as
          much, buys expensive organic items, or never cooks but snacks
          constantly.
        </p>

        <p>
          <strong>Best for:</strong> Close friends or couples who eat together
          regularly and have similar consumption habits.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          3. Hybrid (Shared Staples + Individual Items)
        </h3>

        <p>
          Some items are shared and split evenly. Others are individual and
          tracked separately. This is the sweet spot for most households.
        </p>

        <p>
          <strong>Pros:</strong> Balances fairness with simplicity. Reduces
          waste. Still feels communal.
        </p>

        <p>
          <strong>Cons:</strong> Requires a bit more tracking and clear
          expectations upfront.
        </p>

        <p>
          <strong>Best for:</strong> Most roommate situations — especially when
          people cook at different frequencies or have different budgets.
        </p>

        <h2 id="hybrid-system" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          The Hybrid System Explained
        </h2>

        <p>
          Here&apos;s how the hybrid system works. You divide grocery items
          into two categories: shared and individual.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Shared Items (Split Evenly)
        </h3>

        <p>
          These are staples that everyone uses, are hard to track per-person,
          or last a long time:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Cooking oil, butter, spices, salt, pepper</li>
          <li>Condiments (ketchup, mayo, mustard, soy sauce)</li>
          <li>Household basics (dish soap, sponges, trash bags)</li>
          <li>Bathroom supplies (toilet paper, paper towels, hand soap)</li>
          <li>Shared pantry items (flour, sugar, rice, pasta)</li>
        </ul>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Individual Items (Each Person Pays)
        </h3>

        <p>
          These are items with clear personal ownership or significant cost
          variation:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Proteins (meat, fish, tofu)</li>
          <li>Snacks and specialty items (chips, cookies, energy bars)</li>
          <li>Personal beverages (beer, wine, kombucha, fancy coffee)</li>
          <li>Dietary-specific items (gluten-free bread, vegan cheese)</li>
          <li>Meal prep containers or individual lunches</li>
        </ul>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          The Rotation Rule
        </h3>

        <p>
          For shared items, whoever uses the last of it replaces it — or you
          set up a rotation schedule. Example: One person buys toilet paper in
          January, another in February, etc.
        </p>

        <p>
          This prevents the &quot;I always buy the paper towels&quot;
          resentment spiral.
        </p>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
          <p className="text-amber-800 font-medium mb-1">
            💡 Don&apos;t nickel-and-dime over $2 items
          </p>
          <p className="text-amber-700 text-sm">
            Track the big stuff — meat, alcohol, specialty items, bulk
            purchases. Split staples evenly and don&apos;t stress if someone
            uses more ketchup than you. Precision costs more in mental overhead
            than it saves in dollars.
          </p>
        </div>

        <h2 id="tracking" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          How to Track Shared Grocery Costs
        </h2>

        <p>
          Tracking doesn&apos;t have to be complicated. Here&apos;s a simple
          system that works:
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Step 1: Save the Receipt
        </h3>

        <p>
          Take a photo of the grocery receipt immediately. Don&apos;t rely on
          memory.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Step 2: Mark Shared Items
        </h3>

        <p>
          Circle or highlight shared items on the receipt. Everything else is
          individual.
        </p>

        <p>
          Example: A $120 grocery trip might have $40 in shared items (dish
          soap, olive oil, rice, condiments) and $80 in individual items
          (chicken, wine, snacks).
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Step 3: Log It
        </h3>

        <p>
          Use a shared expense app (like PartyTab), a shared spreadsheet, or
          even a group chat. Log:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Date of purchase</li>
          <li>Total amount spent</li>
          <li>Amount for shared items</li>
          <li>Who paid</li>
        </ul>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Step 4: Settle Up Monthly
        </h3>

        <p>
          At the end of the month, add up shared costs and split them evenly.
          Settle balances via Venmo, Zelle, or cash.
        </p>

        <p>
          Example: In March, shared grocery costs totaled $180. Split among 3
          roommates = $60 each. Roommate A paid $100, Roommate B paid $50,
          Roommate C paid $30. Settlement: B owes A $10, C owes A $30.
        </p>

        <h2 id="agreement" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          The Roommate Agreement
        </h2>

        <p>
          Most grocery conflicts happen because expectations were never set.
          Avoid this by having a 10-minute conversation when you move in (or
          right now if you&apos;re already living together).
        </p>

        <p>Questions to answer:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Who does the shopping?</strong> One person? Rotating? Each
            person shops for themselves?
          </li>
          <li>
            <strong>How often?</strong> Weekly? Bi-weekly? As-needed?
          </li>
          <li>
            <strong>What&apos;s the shared budget?</strong> $100/month per
            person? No cap?
          </li>
          <li>
            <strong>What happens if someone eats more?</strong> Do they chip in
            extra, or is it evened out over time?
          </li>
          <li>
            <strong>What about dietary restrictions?</strong> If one person is
            vegan and buys expensive plant-based items, are those shared or
            individual?
          </li>
        </ul>

        <p>
          Write it down. Stick it on the fridge. Revisit it in 3 months if
          it&apos;s not working.
        </p>

        <h2 id="flash-points" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          Common Flash Points (and How to Handle Them)
        </h2>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Flash Point 1: The Roommate Who Eats Everything
        </h3>

        <p>
          <strong>The problem:</strong> One person eats twice as much as
          everyone else, but costs are split evenly.
        </p>

        <p>
          <strong>The fix:</strong> Switch to a hybrid system. Shared staples
          stay shared, but high-consumption items (snacks, proteins) become
          individual. Or agree on portion limits for shared items.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Flash Point 2: The Roommate Who Never Buys Communal Items
        </h3>

        <p>
          <strong>The problem:</strong> One person always seems to be out when
          it&apos;s time to restock toilet paper or dish soap.
        </p>

        <p>
          <strong>The fix:</strong> Set up a rotation schedule or track shared
          purchases in an app. If someone&apos;s consistently skipping their
          turn, bring it up directly: &quot;Hey, I&apos;ve bought the last 3
          rounds of paper towels — can you grab the next one?&quot;
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Flash Point 3: Dietary Differences (Vegan vs Meat-Eater)
        </h3>

        <p>
          <strong>The problem:</strong> One person buys $8/lb grass-fed beef.
          Another buys $3/lb tofu. Splitting evenly feels unfair.
        </p>

        <p>
          <strong>The fix:</strong> Keep proteins individual. Share pantry
          staples (rice, pasta, spices) and split those evenly. This way each
          person controls their protein budget.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">
          Flash Point 4: The &quot;I Barely Eat at Home&quot; Argument
        </h3>

        <p>
          <strong>The problem:</strong> One roommate eats out 5 nights a week
          and doesn&apos;t want to pay for shared groceries they
          &quot;don&apos;t use.&quot;
        </p>

        <p>
          <strong>The fix:</strong> Fully shared systems don&apos;t work here.
          Switch to hybrid or fully separate. Or charge them a flat monthly
          &quot;staples fee&quot; ($20-30) to cover basics like dish soap,
          olive oil, and toilet paper — things they use even if they
          don&apos;t cook.
        </p>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
          <h4 className="font-semibold text-teal-900 mb-2">
            PartyTab tracks shared expenses — log grocery runs and settle up
            monthly
          </h4>
          <p className="text-teal-800 text-sm mb-4">
            Create a tab for your household, log shared grocery costs, and let
            PartyTab calculate who owes what. No spreadsheets, no mental math.
          </p>
          <Link
            href="/tabs/new"
            className="inline-block bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition"
          >
            Try PartyTab Free
          </Link>
        </div>

        <h2 id="final-tips" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          Final Tips for Grocery Harmony
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Label your stuff:</strong> If it&apos;s individual, put
            your name on it. Masking tape + Sharpie. Simple.
          </li>
          <li>
            <strong>Keep a shared shopping list:</strong> Use a whiteboard,
            shared note, or app. When someone finishes the last of the milk,
            they add it to the list.
          </li>
          <li>
            <strong>Don&apos;t let balances pile up:</strong> Settle monthly.
            Letting debts accumulate for 6 months turns a $40 balance into a
            $300 resentment bomb.
          </li>
          <li>
            <strong>Assume good intent:</strong> Most roommates aren&apos;t
            trying to take advantage. If something feels off, talk about it
            before it festers.
          </li>
          <li>
            <strong>Revisit the system:</strong> If the hybrid system
            isn&apos;t working, switch to fully separate. If fully separate
            feels isolating, try hybrid. There&apos;s no one-size-fits-all.
          </li>
        </ul>

        <p>
          Grocery splitting doesn&apos;t have to be a source of tension. With
          clear expectations, a simple tracking system, and a willingness to
          adjust, you can keep the fridge stocked and the roommate vibes
          intact.
        </p>

        <div className="bg-ink-900 rounded-3xl p-8 text-center my-12">
          <h3 className="text-2xl font-bold text-white mb-3">
            Living with roommates?
          </h3>
          <p className="text-ink-300 mb-6 max-w-xl mx-auto">
            PartyTab makes it easy to track shared expenses like groceries,
            utilities, and household supplies — and settle up without the
            awkward Venmo requests.
          </p>
          <Link
            href="/tabs/new"
            className="inline-block bg-teal-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-teal-400 transition mb-4"
          >
            Create a Roommate Tab
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
              href="/blog/split-rent-by-income-calculator"
              className="block p-4 border border-ink-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition"
            >
              <div className="text-xs font-semibold text-teal-600 mb-1">
                GUIDE
              </div>
              <div className="font-semibold text-ink-900 mb-1">
                How to Split Rent Fairly Based on Income
              </div>
              <div className="text-sm text-ink-600">
                Step-by-step calculator logic for proportional rent splitting
                based on income.
              </div>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
