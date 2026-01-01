"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type PendingMerge = {
  guestUserId: string;
  guestDisplayName: string;
  targetUserId: string;
};

export default function MergeConfirmPage() {
  const router = useRouter();
  const [pendingMerge, setPendingMerge] = useState<PendingMerge | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch pending merge info from API
    fetch("/api/auth/merge-confirm")
      .then((res) => res.json())
      .then((data) => {
        if (data.pendingMerge) {
          setPendingMerge(data.pendingMerge);
        } else {
          // No pending merge, redirect to tabs
          router.replace("/tabs");
        }
      })
      .catch(() => {
        router.replace("/tabs");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingMerge || !pin) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/merge-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to verify PIN");
        setSubmitting(false);
        return;
      }

      // Merge successful, redirect to tabs
      router.replace("/tabs");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSubmitting(true);
    try {
      // Clear the pending merge cookie
      await fetch("/api/auth/merge-confirm", {
        method: "DELETE",
      });
      router.replace("/tabs");
    } catch {
      router.replace("/tabs");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-start justify-center bg-sand-50 px-4 pt-16">
        <p className="text-ink-500">Loading...</p>
      </div>
    );
  }

  if (!pendingMerge) {
    return null;
  }

  return (
    <div className="min-h-[80vh] flex items-start justify-center bg-sand-50 px-4 pt-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">Link Your Account</h1>
          <p className="mt-2 text-sm text-ink-500">
            We found an existing guest session
          </p>
        </div>

        <div className="rounded-3xl border border-sand-200 bg-white/80 p-6 space-y-4">
          <div className="text-center py-4">
            <p className="text-lg text-ink-700">
              Are you <span className="font-semibold">{pendingMerge.guestDisplayName}</span>?
            </p>
            <p className="mt-2 text-sm text-ink-500">
              Enter your PIN to link your guest activity to your Google account.
            </p>
          </div>

          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-ink-700 mb-1">
                Your 4-digit PIN
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPin(value);
                }}
                placeholder="••••"
                className="w-full rounded-xl border border-sand-200 px-4 py-3 text-center text-2xl tracking-[0.5em] focus:border-ink-400 focus:outline-none focus:ring-1 focus:ring-ink-400"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={pin.length !== 4 || submitting}
              className="w-full rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Linking..." : "Confirm & Link Account"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-ink-400">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            disabled={submitting}
            className="w-full rounded-full border border-sand-200 px-6 py-3 text-sm font-medium text-ink-600 hover:bg-sand-50 transition disabled:opacity-50"
          >
            Skip (don&apos;t link accounts)
          </button>

          <p className="text-xs text-center text-ink-400">
            Skipping will keep your guest and Google accounts separate.
          </p>
        </div>
      </div>
    </div>
  );
}
