"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

type UserTier = "GUEST" | "BASIC" | "PRO" | null;

export default function UpgradePage() {
  const [showProPreview, setShowProPreview] = useState(false);
  const [currentTier, setCurrentTier] = useState<UserTier>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.subscriptionTier) {
          setCurrentTier(data.user.subscriptionTier);
        }
      })
      .catch(() => {
        // Silently fail - user will just see upgrade options
      });
  }, []);

  const handleGoogleUpgrade = () => {
    signIn("google", { callbackUrl: "/tabs" });
  };

  return (
    <div className="min-h-[80vh] flex items-start justify-center bg-sand-50 px-4 pt-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">
            {currentTier ? "Your Plan" : "Upgrade Your Account"}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {currentTier
              ? "See what's included in your plan or upgrade for more features"
              : "Get more from PartyTab with a free or Pro account"
            }
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Guest Tier */}
          <div className={`rounded-3xl border-2 p-6 space-y-5 relative ${
            currentTier === "GUEST"
              ? "border-ink-400 bg-sand-100"
              : "border-sand-100 bg-sand-50/50"
          }`}>
            {currentTier === "GUEST" && (
              <div className="absolute -top-3 left-6">
                <span className="rounded-full bg-ink-500 px-3 py-1 text-xs font-medium text-white">
                  Your plan
                </span>
              </div>
            )}
            <div className={currentTier === "GUEST" ? "pt-2" : ""}>
              <h2 className="text-xl font-semibold text-ink-500">Guest</h2>
              <p className="mt-1 text-sm text-ink-400">
                Quick access, no signup
              </p>
            </div>

            <div className="text-3xl font-bold text-ink-400">
              Free
            </div>

            <ul className="space-y-3 text-sm text-ink-500">
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-400" />
                <span>Join tabs via invite link</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-400" />
                <span>Add expenses to shared tabs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-400" />
                <span>View and confirm settlements</span>
              </li>
              <li className="flex items-start gap-2">
                <XIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-300" />
                <span className="text-ink-400">Cannot create tabs</span>
              </li>
              <li className="flex items-start gap-2">
                <XIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-300" />
                <span className="text-ink-400">Data tied to single device</span>
              </li>
            </ul>

            <a
              href="/signin"
              className="block w-full text-center rounded-full border border-sand-200 bg-white px-6 py-3 text-sm font-medium text-ink-500 hover:bg-sand-50 transition"
            >
              Continue as Guest
            </a>
          </div>

          {/* Member Tier */}
          <div className={`rounded-3xl border-2 p-6 space-y-5 relative ${
            currentTier === "BASIC"
              ? "border-green-500 bg-green-50"
              : "border-green-300 bg-white/80"
          }`}>
            <div className="absolute -top-3 left-6">
              <span className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
                currentTier === "BASIC" ? "bg-green-600" : "bg-green-500"
              }`}>
                {currentTier === "BASIC" ? "Your plan" : "Recommended"}
              </span>
            </div>
            <div className="pt-2">
              <h2 className="text-xl font-semibold">Member</h2>
              <p className="mt-1 text-sm text-ink-500">
                Perfect for tab creators
              </p>
            </div>

            <div className="text-2xl font-bold">
              Free<span className="text-base font-normal text-ink-400"> with Google sign in</span>
            </div>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Create up to <strong>3 active tabs</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Join unlimited tabs as guest</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Add expenses with even splits</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Custom split amounts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Settlement tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Sync across devices</span>
              </li>
            </ul>

            {currentTier === "BASIC" ? (
              <div className="w-full rounded-full bg-green-100 px-6 py-3 text-sm font-medium text-green-700 text-center">
                ✓ Current plan
              </div>
            ) : (
              <button
                onClick={handleGoogleUpgrade}
                className="w-full flex items-center justify-center gap-3 rounded-full border border-sand-200 bg-white px-6 py-3 text-sm font-medium hover:bg-sand-50 transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Upgrade with Google
              </button>
            )}
          </div>

          {/* Pro Tier */}
          <div className={`rounded-3xl border-2 p-6 space-y-5 relative overflow-hidden ${
            currentTier === "PRO"
              ? "border-amber-500 bg-amber-50"
              : "border-ink-900 bg-white/80"
          }`}>
            <div className="absolute top-4 right-4">
              <span className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
                currentTier === "PRO" ? "bg-amber-500" : "bg-ink-900"
              }`}>
                {currentTier === "PRO" ? "Your plan" : "Coming Soon"}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Pro</h2>
              <p className="mt-1 text-sm text-ink-500">
                For power users & groups
              </p>
            </div>

            <div className="text-3xl font-bold">
              $3<span className="text-base font-normal text-ink-400">/month</span>
            </div>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span><strong>Unlimited</strong> active tabs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Everything in Member</span>
              </li>
              <li className="flex items-start gap-2">
                <SparkleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <span><strong>Receipt scanning</strong> with AI parsing</span>
              </li>
              <li className="flex items-start gap-2">
                <SparkleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <span><strong>Claim mode</strong> — let guests claim items</span>
              </li>
              <li className="flex items-start gap-2">
                <SparkleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <span>Receipt image storage as proof</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Priority support</span>
              </li>
            </ul>

            <button
              onClick={() => setShowProPreview(true)}
              className="w-full rounded-full bg-ink-200 px-6 py-3 text-sm font-semibold text-ink-500 cursor-not-allowed"
              disabled
            >
              Join Waitlist
            </button>

            <button
              onClick={() => setShowProPreview(true)}
              className="w-full text-center text-sm text-ink-500 hover:text-ink-700 underline"
            >
              Preview Pro features
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-ink-400">
          Your guest activity will be merged into your new account.
        </p>
      </div>

      {/* Pro Preview Modal */}
      {showProPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Pro Feature Preview</h2>
              <button
                onClick={() => setShowProPreview(false)}
                className="rounded-full p-2 hover:bg-sand-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4">
              <h3 className="font-medium text-ink-700 mb-3">Receipt Scanning & Claim Mode</h3>

              {/* Mock receipt preview */}
              <div className="rounded-xl border border-sand-200 bg-white p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-ink-500 border-b border-sand-100 pb-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  AI-parsed receipt items
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b border-sand-50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm">Margherita Pizza</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">$18.00</span>
                      <div className="flex -space-x-1">
                        <div className="h-6 w-6 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-xs font-medium">A</div>
                        <div className="h-6 w-6 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-xs font-medium">B</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-sand-50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm">Caesar Salad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">$12.00</span>
                      <div className="flex -space-x-1">
                        <div className="h-6 w-6 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center text-xs font-medium">C</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-sand-50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm">Garlic Bread</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">$6.00</span>
                      <div className="flex -space-x-1">
                        <div className="h-6 w-6 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-xs font-medium">A</div>
                        <div className="h-6 w-6 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-xs font-medium">B</div>
                        <div className="h-6 w-6 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center text-xs font-medium">C</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-ink-400">
                  Guests claim what they ate. Splits calculated automatically.
                </div>
              </div>
            </div>

            <div className="text-sm text-ink-600 space-y-2">
              <p><strong>How it works:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-ink-500">
                <li>Snap a photo of your receipt</li>
                <li>AI extracts each item and price</li>
                <li>Guests claim the items they ordered</li>
                <li>Splits are calculated automatically</li>
              </ol>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowProPreview(false)}
                className="w-full rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-800 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
    </svg>
  );
}
