"use client";

export function StartScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">IDKYP</h1>
      <p className="mt-2 text-ink-500">I don&apos;t know, you pick.</p>
      <p className="mt-4 text-sm text-ink-400">
        Decide where to eat — drop a pin, set a radius, eliminate until one&apos;s left.
      </p>
      <button
        type="button"
        onClick={onBegin}
        className="mt-6 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
      >
        Find food →
      </button>
    </div>
  );
}
