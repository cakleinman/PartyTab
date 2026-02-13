import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Page Not Found | PartyTab",
    description: "The page you're looking for doesn't exist. Head back to PartyTab to split expenses with friends.",
};

export default function NotFound() {
    return (
        <div className="max-w-2xl mx-auto py-20 px-4 text-center">
            <p className="text-6xl font-bold text-teal-600 mb-4">404</p>
            <h1 className="text-3xl font-bold text-ink-900 mb-4">Page not found</h1>
            <p className="text-lg text-ink-600 mb-10">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/"
                    className="inline-block bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                >
                    Go Home
                </Link>
                <Link
                    href="/blog"
                    className="inline-block border border-sand-300 text-ink-700 px-8 py-3 rounded-xl font-semibold hover:border-teal-300 hover:text-teal-700 transition-colors"
                >
                    Read the Blog
                </Link>
            </div>

            <div className="mt-16 text-sm text-ink-400">
                <p>Looking for something specific?</p>
                <div className="flex flex-wrap gap-4 justify-center mt-3">
                    <Link href="/how-it-works" className="hover:text-teal-600 transition-colors">
                        How It Works
                    </Link>
                    <Link href="/use-cases" className="hover:text-teal-600 transition-colors">
                        Use Cases
                    </Link>
                    <Link href="/compare/splitwise" className="hover:text-teal-600 transition-colors">
                        PartyTab vs Splitwise
                    </Link>
                    <Link href="/upgrade" className="hover:text-teal-600 transition-colors">
                        Upgrade to Pro
                    </Link>
                </div>
            </div>
        </div>
    );
}
