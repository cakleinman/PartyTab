"use client";

import { useRef, useState } from "react";

interface AccessCardProps {
  displayName: string;
  pin: string;
  onContinue: () => void;
}

export function AccessCard({ displayName, pin, onContinue }: AccessCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveToPhotos = async () => {
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;

      if (!cardRef.current) return;

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `partytab-access-${displayName.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to save card:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
          <svg
            className="h-6 w-6 text-teal-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-semibold">You&apos;re in!</h2>
        <p className="mt-2 text-sm text-ink-500">
          Save your access card to sign in from any device.
        </p>
      </div>

      <div
        ref={cardRef}
        className="rounded-3xl border-2 border-ink-900 bg-white p-6 space-y-4"
      >
        <div className="text-center">
          <div className="text-xs uppercase tracking-wide text-ink-500">
            PartyTab Access Card
          </div>
          <div className="mt-1 text-lg font-semibold">{displayName}</div>
        </div>

        <div className="flex justify-center">
          <div className="rounded-2xl bg-sand-100 px-6 py-4 text-center">
            <div className="text-xs text-ink-500">Your PIN</div>
            <div className="mt-1 text-3xl font-bold tracking-wider font-mono">
              {pin}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-sand-50 p-4 text-center text-sm text-ink-600">
          <p className="font-medium">To sign in from another device:</p>
          <p className="mt-1">
            Go to <span className="font-semibold">partytab.app</span>
          </p>
          <p>
            Enter &ldquo;{displayName}&rdquo; and &ldquo;{pin}&rdquo;
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleSaveToPhotos}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-sand-200 bg-white px-6 py-3 text-sm font-semibold hover:bg-sand-50 transition disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {saving ? "Saving..." : "Save to Photos"}
        </button>

        <button
          onClick={onContinue}
          className="w-full rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-800 transition"
        >
          Continue to Tab
        </button>
      </div>
    </div>
  );
}
