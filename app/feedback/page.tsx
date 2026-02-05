"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FeedbackPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "other">("other");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, feedbackType }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error?.message ?? "Failed to submit feedback");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-sand-200 bg-white/80 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <svg className="h-8 w-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-ink-900">Thank you!</h1>
          <p className="mt-2 text-ink-600">
            Your feedback has been sent. We really appreciate you taking the time to help us improve PartyTab.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 rounded-full bg-teal-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-teal-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>

      <div className="rounded-3xl border border-sand-200 bg-white/80 p-8">
        <h1 className="text-2xl font-semibold text-ink-900">Send us feedback</h1>
        <p className="mt-2 text-ink-600">
          Found a bug? Have an idea? We'd love to hear from you.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="feedbackType" className="block text-sm font-medium text-ink-700">
              What kind of feedback?
            </label>
            <select
              id="feedbackType"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value as "bug" | "feature" | "other")}
              className="mt-1 block w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-ink-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="bug">Bug report</option>
              <option value="feature">Feature request</option>
              <option value="other">Other feedback</option>
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink-700">
              Name <span className="text-ink-400">(optional)</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1 block w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700">
              Email <span className="text-ink-400">(optional, if you want a reply)</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-ink-700">
              Your message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="Tell us what's on your mind..."
              className="mt-1 block w-full resize-none rounded-xl border border-sand-300 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="w-full rounded-full bg-teal-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
