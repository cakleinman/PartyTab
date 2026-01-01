import { CyclingText } from "@/app/components/CyclingText";

export default function LandingPage() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        <p className="text-sm uppercase tracking-[0.25em] text-ink-500">
          Shared Tabs for <CyclingText />
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-ink-900 md:text-5xl">
          Split expenses without splitting up the group.
        </h1>
        <p className="text-lg text-ink-700">
          PartyTab keeps shared spending calm and simple for trips, dinners, or
          any temporary group. Track together, settle whenever, stay friends.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="/tabs/new"
            className="btn-primary rounded-full px-6 py-3 text-sm font-semibold"
          >
            Create a tab
          </a>
          <a
            href="/home"
            className="btn-secondary rounded-full px-6 py-3 text-sm font-semibold"
          >
            View my tabs
          </a>
        </div>
        <div className="grid gap-4 pt-6 text-sm text-ink-500">
          <p>Invite only · No payments · No pressure</p>
          <p>Minimal, deterministic settlement math</p>
        </div>
      </section>
      <section className="relative rounded-3xl border border-sand-200 bg-white/70 p-6 shadow-sm">
        <span className="absolute -top-3 left-4 rounded-full bg-sand-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-ink-500">
          Example
        </span>
        <div className="space-y-6">
          <div className="rounded-2xl bg-sand-100 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
              This weekend
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Lake House</h2>
            <p className="mt-2 text-sm text-ink-500">Total so far</p>
            <p className="text-3xl font-semibold text-ink-900">$428.20</p>
          </div>
          <div className="space-y-4">
            {[
              { label: "You", value: "Even so far" },
              { label: "Maya", value: "You're owed $24.10" },
              { label: "Jordan", value: "You owe $24.10" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-sand-200 bg-white px-4 py-3 text-sm"
              >
                <span className="font-medium text-ink-700">{item.label}</span>
                <span className="text-ink-500">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-dashed border-ink-300 px-4 py-3 text-sm text-ink-500">
            Final amounts calculated when the tab closes.
          </div>
        </div>
      </section>
    </div>
  );
}
