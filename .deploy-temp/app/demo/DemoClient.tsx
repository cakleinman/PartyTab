"use client";

import { useState } from "react";
import { useToast } from "@/app/components/ToastProvider";

export default function DemoClient() {
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [closedTabId, setClosedTabId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();

  const handleReset = async () => {
    setLoading(true);
    const res = await fetch("/api/dev/reset", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      pushToast(data?.error?.message ?? "Reset failed.");
      setLoading(false);
      return;
    }
    setActiveTabId(data.activeTabId);
    setClosedTabId(data.closedTabId);
    pushToast("Demo data reset.");
    setLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Demo mode</h1>
        <p className="text-sm text-ink-500">
          Reset and reload demo data for local walkthroughs.
        </p>
      </div>

      <button
        type="button"
        onClick={handleReset}
        disabled={loading}
        className="btn-primary rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
      >
        {loading ? "Resetting…" : "Reset demo data"}
      </button>

      {(activeTabId || closedTabId) && (
        <div className="rounded-3xl border border-sand-200 bg-white/80 p-6 text-sm text-ink-500">
          <p>Demo tabs:</p>
          {activeTabId && (
            <p className="mt-2">
              Active tab: <a className="font-semibold text-ink-700" href={`/tabs/${activeTabId}`}>{activeTabId}</a>
            </p>
          )}
          {closedTabId && (
            <p className="mt-2">
              Closed tab: <a className="font-semibold text-ink-700" href={`/tabs/${closedTabId}`}>{closedTabId}</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
