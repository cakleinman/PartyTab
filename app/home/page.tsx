"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/app/components/ToastProvider";

type TabSummary = {
  id: string;
  name: string;
  status: "ACTIVE" | "CLOSED";
  startDate: string;
  endDate: string | null;
  createdAt: string;
  closedAt: string | null;
  settlementProgress: {
    total: number;
    confirmed: number;
    percent: number;
  } | null;
};

export default function HomePage() {
  const [tabs, setTabs] = useState<TabSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    let active = true;
    fetch("/api/tabs")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setTabs(data.tabs ?? []);
      })
      .catch(() => {
        if (!active) return;
        setError("Couldn't load your tabs.");
        pushToast("Network error loading tabs.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Your tabs</h1>
          <p className="text-sm text-ink-500">Active tabs first, closed tabs after.</p>
        </div>
        <a
          href="/tabs/new"
          className="btn-primary rounded-full px-5 py-2 text-sm font-semibold"
        >
          New tab
        </a>
      </div>

      {loading && <p className="text-sm text-ink-500">Loading tabs…</p>}
      {error && <p className="text-sm text-ink-500">{error}</p>}

      {!loading && tabs.length === 0 && (
        <div className="rounded-3xl border border-sand-200 bg-white/70 p-8 text-center text-sm text-ink-500">
          You haven't started a tab yet. Create one to begin tracking.
        </div>
      )}

      <div className="grid gap-4">
        {tabs.map((tab) => {
          const progress = tab.settlementProgress;
          const isComplete = progress && progress.percent === 100;

          return (
            <a
              key={tab.id}
              href={`/tabs/${tab.id}`}
              className="rounded-3xl border border-sand-200 bg-white/80 p-5 transition hover:border-ink-300"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-ink-900">{tab.name}</h2>
                  <p className="text-sm text-ink-500">
                    Started {tab.startDate} · {tab.status === "ACTIVE" ? "Active" : "Closed"}
                  </p>
                </div>
                {tab.status === "CLOSED" && progress ? (
                  <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center">
                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-sand-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={isComplete ? "text-green-500" : "text-ink-900"}
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={`${progress.percent}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-xs font-semibold">{progress.percent}%</span>
                  </div>
                ) : (
                  <span className="rounded-full border border-sand-200 px-3 py-1 text-xs uppercase tracking-wide text-ink-500">
                    {tab.status}
                  </span>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
