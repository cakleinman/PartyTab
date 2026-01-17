"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUnsubscribe = async () => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid unsubscribe link");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/email/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(
          data.message || "Failed to unsubscribe. Please try again."
        );
        setLoading(false);
        return;
      }

      setStatus("success");
      setLoading(false);
    } catch (error) {
      console.error("Unsubscribe error:", error);
      setStatus("error");
      setErrorMessage("An error occurred. Please try again later.");
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-sand-50 px-4 pt-8 md:pt-16">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-ink-900">
              Invalid Link
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              The unsubscribe link is missing or invalid.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-teal-600 hover:text-teal-700 underline"
            >
              Return to PartyTab
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-start justify-center bg-sand-50 px-4 pt-8 md:pt-16">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-ink-900">
              Successfully Unsubscribed
            </h1>
            <p className="mt-2 text-sm text-ink-600">
              You have been unsubscribed from PartyTab reminder emails. You
              won&apos;t receive payment reminders, but you can still use
              PartyTab normally.
            </p>
          </div>

          <div className="rounded-3xl border border-sand-200 bg-white/80 p-6 space-y-4">
            <div className="bg-sand-50 rounded-lg p-4 text-sm text-ink-600">
              <p className="font-medium mb-2">What changes:</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • You won&apos;t receive email reminders about pending
                  payments
                </li>
                <li>• You can still create and manage tabs normally</li>
                <li>
                  • Other participants can still send you payment reminders
                </li>
              </ul>
            </div>

            <div className="text-center space-y-3">
              <p className="text-xs text-ink-500">
                Want to change this in the future? Sign into your account and
                update your email preferences.
              </p>
              <Link
                href="/"
                className="inline-block bg-ink-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-ink-800 transition-colors"
              >
                Back to PartyTab
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-sand-50 px-4 pt-8 md:pt-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-ink-900">
            Unsubscribe from Emails
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            You&apos;re about to unsubscribe from PartyTab reminder emails.
          </p>
        </div>

        <div className="rounded-3xl border border-sand-200 bg-white/80 p-6 space-y-4">
          <div className="bg-sand-50 rounded-lg p-4 text-sm text-ink-600">
            <p className="font-medium mb-2">If you unsubscribe:</p>
            <ul className="space-y-2 text-xs">
              <li className="flex gap-2">
                <span className="text-ink-400 flex-shrink-0">•</span>
                <span>
                  You won&apos;t receive email reminders about payments you owe
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-ink-400 flex-shrink-0">•</span>
                <span>
                  You can still create and manage tabs in PartyTab
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-ink-400 flex-shrink-0">•</span>
                <span>
                  You&apos;ll still see notifications in your PartyTab account
                </span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleUnsubscribe}
            disabled={loading}
            className="w-full rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Unsubscribing..." : "Yes, Unsubscribe Me"}
          </button>

          {status === "error" && errorMessage && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              <p className="font-medium mb-1">Error</p>
              <p className="text-xs">{errorMessage}</p>
            </div>
          )}

          <Link
            href="/"
            className="block text-center text-sm font-medium text-ink-600 hover:text-ink-900 transition"
          >
            Keep me subscribed
          </Link>
        </div>

        <p className="text-center text-xs text-ink-400">
          Questions?{" "}
          <Link href="/privacy" className="underline hover:text-ink-600">
            Check our privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-sand-50">
          <p className="text-ink-500">Loading...</p>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
