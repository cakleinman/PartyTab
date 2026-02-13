import type { Metadata } from "next";
import Link from "next/link";

import { AuthorBio } from "@/app/components/AuthorBio";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
  title: "The Complete Guide to Splitting Road Trip Expenses | PartyTab",
  description:
    "Gas, tolls, food, hotels — road trip expenses add up fast. Here&apos;s how to split costs fairly among passengers, decide if the driver should pay less, and settle up before you get home.",
  keywords: [
    "split road trip costs",
    "road trip expense sharing",
    "how to split gas money friends",
    "divide road trip expenses",
    "share driving costs",
    "road trip budget split",
    "who pays for gas road trip",
    "split car costs friends",
  ],
  openGraph: {
    title: "The Complete Guide to Splitting Road Trip Expenses",
    description:
      "Gas, tolls, food, hotels — road trip expenses add up fast. Here&apos;s how to split costs fairly and settle up before you get home.",
    url: "https://partytab.app/blog/road-trip-expense-splitting",
  },
  alternates: {
    canonical: "https://partytab.app/blog/road-trip-expense-splitting",
  },
};

export default function RoadTripExpenseSplittingPage() {
  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
            <BlogPostJsonLd
                title="The Complete Guide to Splitting Road Trip Expenses"
                description="Gas, tolls, food, hotels — road trip expenses add up fast. Here&apos;s how to split costs fairly among passengers, decide if the driver should pay less, and settle up before you get home."
                slug="road-trip-expense-splitting"
                datePublished="2026-06-11"
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Blog", url: "https://partytab.app/blog" },
                    { name: "The Complete Guide to Splitting Road Trip Expenses", url: "https://partytab.app/blog/road-trip-expense-splitting" },
                ]}
            />

      <nav className="text-sm text-ink-500 mb-8">
        <Link href="/" className="hover:text-ink-700">
          Home
        </Link>
        {" → "}
        <Link href="/blog" className="hover:text-ink-700">
          Blog
        </Link>
        {" → "}
        <span className="text-ink-900">The Complete Guide to Splitting Road Trip Expenses</span>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
            GUIDE
          </span>
          <time dateTime="2026-06-11" className="text-sm text-ink-400">
            June 11, 2026 · 6 min read
          </time>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 leading-tight">
          The Complete Guide to Splitting Road Trip Expenses
        </h1>
        <p className="text-xl text-ink-600">
          Gas, tolls, food, hotels — road trip expenses add up fast. Here&apos;s how to split costs
          fairly among passengers, decide if the driver should pay less, and settle up before you
          get home.
        </p>
      </header>

      <div className="prose prose-lg max-w-none">
        <p>
          Road trips are the ultimate group adventure. Pack the car, load up a playlist, and hit the
          open road with your favorite people.
        </p>

        <p>
          But between gas, tolls, food stops, motels, and the one friend who keeps insisting you
          stop at every roadside attraction with a &quot;World&apos;s Largest&quot; sign, expenses
          add up fast.
        </p>

        <p>
          And without a clear plan for who pays for what, you end up with awkward conversations at
          gas stations, forgotten receipts, and someone inevitably feeling like they paid more than
          their share.
        </p>

        <p>Here&apos;s how to split road trip costs fairly from start to finish.</p>

        <h2 id="cost-categories" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          The Major Cost Categories
        </h2>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">Gas</h3>

        <p>
          Usually the biggest shared cost. Gas should be split evenly among all passengers. The
          driver shouldn&apos;t pay more just because they&apos;re driving — they&apos;re providing
          the car, which is already a contribution.
        </p>

        <p>
          <strong>How to handle it:</strong> One person pays at each stop and logs the amount. Tally
          it at the end and divide by number of people.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">Tolls</h3>

        <p>
          Small but frequent. Easy to lose track of. If you&apos;re using a toll transponder, check
          the account at the end of the trip.
        </p>

        <p>
          <strong>How to handle it:</strong> Same as gas — one person tracks, everyone splits evenly.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">Accommodations</h3>

        <p>
          Hotels or motels should be split by room, not by person. If two people share a double and
          one person gets their own room, the solo room costs more.
        </p>

        <p>
          Camping fees get split evenly since everyone&apos;s using the same campsite.
        </p>

        <p>
          <strong>How to handle it:</strong> Book rooms together, split costs by room at checkout.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">Food</h3>

        <p>
          This one&apos;s tricky. Shared meals (group dinners, breakfast stops where everyone orders
          something similar) should be split evenly or by item if orders vary wildly.
        </p>

        <p>
          Individual snacks, drinks, or solo meals are <strong>not</strong> shared costs. If someone
          wants a $12 gas station energy drink, they pay for it themselves.
        </p>

        <p>
          <strong>How to handle it:</strong> Decide upfront whether you&apos;re splitting food evenly
          or by item. If someone has dietary restrictions or consistently orders less, go by item.
        </p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">Car Costs (Wear and Tear)</h3>

        <p>
          If someone&apos;s using their personal car for a long road trip, consider offering a
          per-mile rate for wear and tear. Cars aren&apos;t free to maintain — oil changes, tire
          wear, brake pads all add up.
        </p>

        <p>
          A fair rate is $0.20-0.30 per mile, split among passengers (not including the driver).
        </p>

        <p>
          <strong>Example:</strong> 1,500-mile trip, 4 people total, $0.25/mile = $375. Divide by 3
          passengers (not the driver) = $125 per person as a car fee.
        </p>

        <p>This is optional, but appreciated on long trips.</p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">Activities</h3>

        <p>
          Theme parks, museum tickets, kayak rentals — these are individual costs unless the group
          agrees to split them upfront.
        </p>

        <p>
          If three people want to do a zip-line tour and one person wants to sit it out, the three
          people pay for it themselves.
        </p>

        <h2 id="driver-share" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          Should the Driver Pay Less?
        </h2>

        <p>This is the most common road trip debate.</p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">Arguments for:</h3>

        <ul className="list-disc pl-6 space-y-2">
          <li>They&apos;re providing the car</li>
          <li>They&apos;re doing the physical and mental labor of driving</li>
          <li>They&apos;re putting miles on their personal vehicle</li>
        </ul>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">Arguments against:</h3>

        <ul className="list-disc pl-6 space-y-2">
          <li>Everyone benefits equally from the transportation</li>
          <li>If the driver wanted to take this trip solo, they&apos;d pay full gas anyway</li>
          <li>
            Passengers are often contributing by navigating, DJing, or keeping the driver awake
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">The middle ground:</h3>

        <ul className="list-disc pl-6 space-y-2">
          <li>Driver pays less for gas (maybe 50% of their share)</li>
          <li>Group covers 100% of tolls so driver doesn&apos;t pay any</li>
          <li>
            Driver gets a flat $50-100 discount off the total, and the rest is split among
            passengers
          </li>
        </ul>

        <p>
          Whatever you decide, agree on it <strong>before</strong> the trip. Don&apos;t spring it on
          people at the end.
        </p>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
          <p className="text-amber-800 font-medium mb-1">💡 Offer to cover the driver&apos;s gas</p>
          <p className="text-amber-700 text-sm">
            If a friend is providing their car for a long road trip, a generous move is to offer to
            cover their portion of gas entirely, or pay a wear-and-tear fee. Cars aren&apos;t free
            to maintain, and someone offering theirs for a 2,000-mile journey is doing you a favor.
          </p>
        </div>

        <h2 id="tracking" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          The Best Way to Track on the Road
        </h2>

        <p>Don&apos;t rely on memory. You will forget who paid for what by day three.</p>

        <p>Here&apos;s the simplest method:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Assign one person</strong> as the &quot;tracker&quot; — they log every shared
            expense
          </li>
          <li>
            <strong>At each stop,</strong> whoever pays takes a photo of the receipt or logs the
            amount immediately
          </li>
          <li>
            <strong>At the end of each day,</strong> review what was shared vs individual
          </li>
          <li>
            <strong>Use an app</strong> — PartyTab, Splitwise, or even a shared Google Sheet
          </li>
        </ul>

        <p>
          The tracker doesn&apos;t have to be the driver. In fact, it&apos;s better if it&apos;s a
          passenger so they can log expenses in real-time.
        </p>

        <h2 id="fuel-math" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          The Fuel Math
        </h2>

        <p>
          If you want to estimate gas costs ahead of time, here&apos;s a simple formula:
        </p>

        <p>
          <strong>Total miles / MPG × Price per gallon = Total gas cost</strong>
        </p>

        <p>Then divide by the number of people.</p>

        <h3 className="text-xl font-semibold text-ink-900 mt-8 mb-3">Example:</h3>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Trip:</strong> 1,500 miles
          </li>
          <li>
            <strong>Car MPG:</strong> 30
          </li>
          <li>
            <strong>Gas price:</strong> $3.50/gallon
          </li>
          <li>
            <strong>People:</strong> 4
          </li>
        </ul>

        <p>1,500 / 30 = 50 gallons needed</p>
        <p>50 × $3.50 = $175 total gas cost</p>
        <p>$175 / 4 people = $43.75 per person</p>

        <p>
          In reality, you&apos;ll probably spend a bit more due to city driving, detours, and AC
          use. But this gives you a ballpark.
        </p>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 my-8">
          <h4 className="font-semibold text-teal-900 mb-2">Track road trip expenses on the go</h4>
          <p className="text-teal-800 text-sm mb-4">
            PartyTab lets you log gas, tolls, food, and hotels as you go. At the end of the trip,
            see exactly who owes what and settle up in one shot. No spreadsheets, no memory
            required.
          </p>
          <Link
            href="/tabs/new"
            className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Start a Road Trip Tab
          </Link>
        </div>

        <h2 id="settle-up" className="text-2xl font-bold text-ink-900 mt-12 mb-4">
          Settle Up Before You Get Home
        </h2>

        <p>This is non-negotiable.</p>

        <p>
          Do the math on the last day of the trip. Once everyone&apos;s home, momentum dies. The
          &quot;I&apos;ll Venmo you this weekend&quot; promise turns into &quot;Did I already pay
          you?&quot; three weeks later.
        </p>

        <p>
          On the drive home or at the last stop, pull up your tracker, calculate who owes what, and
          send payment requests immediately.
        </p>

        <p>If you&apos;re using PartyTab, it does the math for you and shows exactly who owes whom.</p>

        <h2 className="text-2xl font-bold text-ink-900 mt-12 mb-4">Final Thoughts</h2>

        <p>Road trips are about the experience, not the expense tracking.</p>

        <p>
          But without a clear system, money stress creeps in. Someone feels like they paid for too
          much gas. Another person wonders why they&apos;re covering tolls when the driver pays
          nothing.
        </p>

        <p>
          Split costs fairly, track as you go, and settle up before you unpack. That way, the only
          thing you&apos;re left with is the memory of a great trip — not resentment over $37 in
          unpaid gas money.
        </p>
      </div>

      <div className="mt-12 mb-8">
          <AuthorBio />
      </div>

      <div className="mt-16 pt-8 border-t border-sand-200">
        <div className="bg-ink-900 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-sand-50 mb-2">Hitting the road with friends?</h3>
          <p className="text-ink-300 mb-6">
            Track gas, tolls, hotels, and food as you go. Settle up before you get home.
          </p>
          <Link
            href="/tabs/new"
            className="inline-block bg-teal-500 hover:bg-teal-600 text-ink-900 px-8 py-4 rounded-xl font-semibold transition-colors"
          >
            Start Your Road Trip Tab
          </Link>
          <p className="text-sm text-ink-400 mt-3">Free. No app download needed.</p>
        </div>

        <div className="mt-8">
          <h4 className="text-sm font-semibold text-ink-500 uppercase tracking-wide mb-4">
            Related Articles
          </h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/blog/settle-up-after-group-trip"
              className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
            >
              <div className="text-xs text-teal-600 font-semibold mb-1">GUIDE</div>
              <div className="font-medium text-ink-900">
                How to Actually Settle Up After a Group Trip
              </div>
            </Link>
            <Link
              href="/blog/girls-trip-budget-planning"
              className="block p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
            >
              <div className="text-xs text-teal-600 font-semibold mb-1">GUIDE</div>
              <div className="font-medium text-ink-900">
                Planning a Girls&apos; Trip? Here&apos;s How to Budget
              </div>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
