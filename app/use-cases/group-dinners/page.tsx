import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/app/components/JsonLdSchema";

export const metadata: Metadata = {
    title: "Group Dinner Bill Splitter | PartyTab",
    description:
        "Split restaurant bills fairly when everyone orders differently. Calculate who owes what including tax and tip. No app download required.",
    keywords: [
        "group dinner bill splitter",
        "restaurant bill calculator",
        "split dinner check fairly",
        "dinner expense calculator",
        "itemized bill splitter",
    ],
    openGraph: {
        title: "Group Dinner Bill Splitter | PartyTab",
        description:
            "Split restaurant bills fairly—even when everyone orders differently.",
        url: "https://partytab.app/use-cases/group-dinners",
    },
    alternates: {
        canonical: "https://partytab.app/use-cases/group-dinners",
    },
};

export default function GroupDinnersPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://partytab.app" },
                    { name: "Use Cases", url: "https://partytab.app/use-cases" },
                    { name: "Group Dinners", url: "https://partytab.app/use-cases/group-dinners" },
                ]}
            />
            {/* Breadcrumb */}
            <nav className="text-sm text-ink-500 mb-8">
                <Link href="/" className="hover:text-teal-600">Home</Link>
                <span className="mx-2">→</span>
                <Link href="/use-cases" className="hover:text-teal-600">Use Cases</Link>
                <span className="mx-2">→</span>
                <span className="text-ink-900">Group Dinners</span>
            </nav>

            {/* Hero */}
            <div className="text-center mb-12">
                <span className="text-6xl mb-4 block">🍕</span>
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
                    Group Dinner <span className="text-teal-600">Bill Splitter</span>
                </h1>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                    &ldquo;Just split it evenly&rdquo; doesn&apos;t feel fair when someone
                    ordered lobster and you had a salad. PartyTab lets you track who
                    ordered what.
                </p>
            </div>

            {/* Main CTA */}
            <div className="bg-gradient-to-br from-red-50 to-sand-50 rounded-3xl p-8 mb-12 text-center border border-red-100">
                <h2 className="text-2xl font-bold text-ink-900 mb-2">
                    Big dinner coming up?
                </h2>
                <p className="text-ink-600 mb-6">
                    Create a tab before you go. Add each person&apos;s portion as the
                    orders come.
                </p>
                <Link
                    href="/tabs/new?name=Dinner%20🍕"
                    className="inline-block bg-ink-900 text-sand-50 px-8 py-4 rounded-xl font-semibold hover:bg-ink-700 transition-colors"
                >
                    Start a Dinner Tab →
                </Link>
                <p className="text-sm text-ink-500 mt-3">
                    Works on your phone. No app download needed.
                </p>
            </div>

            {/* The Problem */}
            <div className="mb-12 bg-white rounded-2xl p-8 border border-sand-200">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    The Dinner Bill Dilemma
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                            <span className="text-red-500">✗</span> The &ldquo;Even Split&rdquo; Problem
                        </h3>
                        <ul className="space-y-2 text-sm text-ink-600">
                            <li>• Someone orders expensive wine, you had water</li>
                            <li>• One person gets steak, another gets soup</li>
                            <li>• Half the table got dessert</li>
                            <li>• Result: resentment and awkward vibes</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                            <span className="text-teal-500">✓</span> The PartyTab Way
                        </h3>
                        <ul className="space-y-2 text-sm text-ink-600">
                            <li>• Log each person&apos;s items</li>
                            <li>• Shared apps get split among sharers</li>
                            <li>• Tax and tip distributed proportionally</li>
                            <li>• Everyone pays their fair share</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    How to Split a Dinner Bill Fairly
                </h2>
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-sand-200 text-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold text-red-700">
                            1
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-1 text-sm">Create Tab</h3>
                        <p className="text-xs text-ink-600">Add everyone at the table</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-sand-200 text-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold text-red-700">
                            2
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-1 text-sm">Log Orders</h3>
                        <p className="text-xs text-ink-600">Add each item to the person who ordered</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-sand-200 text-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold text-red-700">
                            3
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-1 text-sm">Add Tax & Tip</h3>
                        <p className="text-xs text-ink-600">Proportionally distributed</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-sand-200 text-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold text-red-700">
                            4
                        </div>
                        <h3 className="font-semibold text-ink-900 mb-1 text-sm">Settle Up</h3>
                        <p className="text-xs text-ink-600">Everyone Venmos the payer</p>
                    </div>
                </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-teal-50 rounded-2xl p-6 mb-12 border border-teal-100">
                <h3 className="font-semibold text-ink-900 mb-2">💡 Pro Tip</h3>
                <p className="text-ink-600">
                    For shared appetizers, create an expense for the item and select only
                    the people who shared it. PartyTab will split it just among them.
                </p>
            </div>

            {/* Features */}
            <div className="bg-sand-50 rounded-3xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-ink-900 mb-6">
                    Perfect for Group Dinners
                </h2>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <span className="text-teal-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Flexible per-item splitting</strong>
                            <p className="text-sm text-ink-600">
                                Each expense can be split differently—shared appetizers among 3,
                                your entrée just to you.
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-teal-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">One person pays, all settle up</strong>
                            <p className="text-sm text-ink-600">
                                Put the whole bill on one card, then everyone sends their share.
                            </p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-teal-600 mt-1">✓</span>
                        <div>
                            <strong className="text-ink-900">Receipt scanning (Pro)</strong>
                            <p className="text-sm text-ink-600">
                                Snap a photo of the receipt to auto-populate items.
                            </p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Bottom CTA */}
            <div className="text-center bg-ink-900 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-sand-50 mb-2">
                    Never fight over the check again
                </h2>
                <p className="text-ink-300 mb-6">
                    Next group dinner, start a tab first.
                </p>
                <Link
                    href="/tabs/new?name=Dinner%20🍕"
                    className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                >
                    Start a Dinner Tab
                </Link>
            </div>

            {/* Related */}
            <div className="mt-12 pt-8 border-t border-sand-200">
                <h3 className="text-lg font-semibold text-ink-900 mb-4">Other Use Cases</h3>
                <div className="flex flex-wrap gap-3">
                    <Link href="/use-cases/bachelor-party" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🎉 Bachelor Parties
                    </Link>
                    <Link href="/use-cases/ski-trips" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        ⛷️ Ski Trips
                    </Link>
                    <Link href="/use-cases/roommates" className="px-4 py-2 bg-sand-100 rounded-full text-sm text-ink-700 hover:bg-sand-200 transition-colors">
                        🏠 Roommates
                    </Link>
                </div>
            </div>
        </div>
    );
}
