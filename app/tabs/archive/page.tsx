"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/app/components/ToastProvider";

type ArchivedTab = {
  id: string;
  name: string;
  startDate: string;
  closedAt: string | null;
  archivedAt: string | null;
  isCreator: boolean;
};

export default function ArchivePage() {
  const [tabs, setTabs] = useState<ArchivedTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { pushToast } = useToast();

  useEffect(() => {
    fetch("/api/tabs/archive")
      .then((res) => res.json())
      .then((data) => {
        setTabs(data.tabs ?? []);
      })
      .catch(() => {
        setError("Couldn't load archived tabs.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleUnarchive = async (tabId: string) => {
    const res = await fetch(`/api/tabs/${tabId}/archive`, { method: "DELETE" });
    if (res.ok) {
      setTabs((prev) => prev.filter((t) => t.id !== tabId));
      pushToast("Tab restored to your list");
    } else {
      pushToast("Failed to unarchive tab");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/tabs" className="text-sm text-ink-500 hover:text-ink-700">
            ← Back to tabs
          </Link>
          <h1 className="text-3xl font-semibold">Archived tabs</h1>
        </div>
      </div>

      {loading && <p className="text-sm text-ink-500">Loading…</p>}
      {error && <p className="text-sm text-ink-500">{error}</p>}

      {!loading && tabs.length === 0 && (
        <div className="rounded-3xl border border-sand-200 bg-white/70 p-8 text-center text-sm text-ink-500">
          No archived tabs.
        </div>
      )}

      <div className="grid gap-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="rounded-3xl border border-sand-200 bg-white/80 p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-ink-900">{tab.name}</h2>
                <p className="text-sm text-ink-500">
                  {tab.startDate} – {tab.closedAt?.slice(0, 10) ?? ""}
                </p>
              </div>
              {tab.isCreator && (
                <button
                  onClick={() => handleUnarchive(tab.id)}
                  className="rounded-full border border-sand-200 px-4 py-2 text-sm font-medium hover:bg-sand-50 transition"
                >
                  Unarchive
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
