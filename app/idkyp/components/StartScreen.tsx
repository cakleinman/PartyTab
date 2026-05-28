"use client";

export function StartScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="animate-fade-in-up flex min-h-[60vh] flex-col items-center justify-center rounded-[2rem] border border-sand-200 bg-white p-10 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-400">idkyp</p>
      <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
        I don&apos;t know,
        <br />
        <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
          you pick.
        </span>
      </h1>
      <p className="mt-4 max-w-md text-sm text-ink-500">
        Drop a pin, set a radius, eliminate until one&apos;s left. The fastest way to settle the
        &ldquo;where should we eat?&rdquo; debate.
      </p>
      <button
        type="button"
        onClick={onBegin}
        className="mt-8 rounded-full bg-teal-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 hover:shadow-md"
      >
        Find food →
      </button>
    </div>
  );
}
