import Link from "next/link";

/**
 * Author bio for blog posts — provides E-E-A-T signals for AI/search engines.
 */
export function AuthorBio() {
  return (
    <div className="flex items-start gap-4 bg-sand-50 rounded-2xl p-6 border border-sand-200">
      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-xl shrink-0">
        📝
      </div>
      <div>
        <p className="font-semibold text-ink-900">The PartyTab Team</p>
        <p className="text-sm text-ink-600 mt-1">
          We build tools that make splitting expenses simple. Our team has
          managed shared costs across hundreds of trips, dinners, and roommate
          situations — and we write about what we&apos;ve learned.
        </p>
        <Link
          href="/how-it-works"
          className="text-sm text-teal-600 hover:text-teal-700 mt-2 inline-block"
        >
          Learn more about PartyTab →
        </Link>
      </div>
    </div>
  );
}
