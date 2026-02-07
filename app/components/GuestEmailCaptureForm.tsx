"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/app/components/ToastProvider";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { EMAIL_REGEX } from "@/lib/validators/schemas";

interface GuestEmailCaptureFormProps {
  tabId: string;
  participantId: string;
  participantName: string;
  onEmailSet?: (email: string) => void;
}

export function GuestEmailCaptureForm({
  tabId,
  participantId,
  participantName,
  onEmailSet,
}: GuestEmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { pushToast } = useToast();

  // Clean up timeout on unmount
  useEffect(() => {
    if (!success) return;

    const timeoutId = setTimeout(() => {
      setEmail("");
      setConsentConfirmed(false);
      setSuccess(false);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [success]);

  const isValidEmail = EMAIL_REGEX.test(email);
  const isSubmitDisabled = !email || !isValidEmail || !consentConfirmed || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/tabs/${tabId}/participants/${participantId}/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            consentConfirmed: true,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error?.message ?? "Failed to add email");
        pushToast(data?.error?.message ?? "Failed to add email");
        return;
      }

      setSuccess(true);
      pushToast("Email added successfully!");
      onEmailSet?.(email);
    } catch {
      const message = "Network error. Please try again.";
      setError(message);
      pushToast(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 rounded-xl border border-sand-200 bg-white p-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-2 text-sm font-medium text-ink-700">Email added successfully!</p>
          <p className="mt-1 text-xs text-ink-500">{email}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-sand-200 bg-white p-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink-900">
          Email address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="mt-2 w-full rounded-lg border border-sand-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-ink-400 transition focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-100 disabled:bg-sand-50 disabled:text-ink-500"
        />
        {email && !isValidEmail && (
          <p className="mt-1 text-xs text-red-600">Please enter a valid email address</p>
        )}
      </div>

      <div className="flex items-start gap-3">
        <input
          id="consent"
          type="checkbox"
          checked={consentConfirmed}
          onChange={(e) => setConsentConfirmed(e.target.checked)}
          disabled={loading}
          className="mt-1 h-4 w-4 rounded border border-sand-300 bg-white text-ink-900 transition focus:outline-none focus:ring-2 focus:ring-ink-400 focus:ring-offset-2 disabled:opacity-50"
        />
        <label htmlFor="consent" className="text-sm text-ink-600">
          I confirm <span className="font-medium">{participantName}</span> gave me permission to add their email
          for payment reminders
        </label>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="w-full rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner />
            Adding email...
          </span>
        ) : (
          "Add email"
        )}
      </button>

      <p className="text-xs text-ink-500 text-center">
        {participantName} can later claim their account and change this email
      </p>
    </form>
  );
}
