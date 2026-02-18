import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-sand-200 bg-sand-50 mt-16">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {/* Product */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-4">
              Product
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-it-works" className="text-ink-600 hover:text-teal-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/use-cases" className="text-ink-600 hover:text-teal-600 transition-colors">
                  Use Cases
                </Link>
              </li>
              <li>
                <Link href="/compare/splitwise" className="text-ink-600 hover:text-teal-600 transition-colors">
                  Compare Splitwise
                </Link>
              </li>
              <li>
                <Link href="/upgrade" className="text-ink-600 hover:text-teal-600 transition-colors">
                  Upgrade to Pro
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-4">
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-ink-600 hover:text-teal-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/blog/feed.xml" className="text-ink-600 hover:text-teal-600 transition-colors">
                  RSS Feed
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-4">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-ink-600 hover:text-teal-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-ink-600 hover:text-teal-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-sand-200 text-center text-xs text-ink-400">
          &copy; {new Date().getFullYear()} PartyTab. Split expenses, not friendships.
        </div>
      </div>
    </footer>
  );
}
