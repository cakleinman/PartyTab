"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useToast } from "@/app/components/ToastProvider";

type UserInfo = {
  displayName: string;
  authProvider: string;
  subscriptionTier: string;
};

type TabSummary = {
  id: string;
  name: string;
  status: "ACTIVE" | "CLOSED";
  startDate: string;
  endDate: string | null;
  createdAt: string;
  closedAt: string | null;
  isCreator: boolean;
  settlementProgress: {
    total: number;
    confirmed: number;
    percent: number;
  } | null;
};

export default function TabsPage() {
  const [tabs, setTabs] = useState<TabSummary[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/tabs").then((res) => res.json()),
      fetch("/api/me").then((res) => res.json()),
    ])
      .then(([tabsData, meData]) => {
        if (!active) return;
        setTabs(tabsData.tabs ?? []);
        if (meData?.user) {
          setUser(meData.user);
        }
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
  }, [pushToast]);

  const handleLogout = async () => {
    if (user?.authProvider === "GUEST") {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/";
    } else {
      await fetch("/api/logout", { method: "POST" });
      await signOut({ callbackUrl: "/" });
    }
  };

  const handleArchive = async (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    const res = await fetch(`/api/tabs/${tabId}/archive`, { method: "POST" });
    if (res.ok) {
      setTabs((prev) => prev.filter((t) => t.id !== tabId));
      pushToast("Tab archived");
    } else {
      const data = await res.json();
      pushToast(data.error?.message ?? "Failed to archive tab");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Your tabs</h1>
          {user && (
            <p className="text-sm text-ink-500">
              {user.displayName}
              {user.subscriptionTier === "GUEST" && (
                <span className="ml-1.5 rounded bg-sand-200 px-1.5 py-0.5 text-[10px] font-medium text-ink-500">Guest</span>
              )}
              {user.subscriptionTier === "BASIC" && (
                <span className="ml-1.5 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">Basic</span>
              )}
              {user.subscriptionTier === "PRO" && (
                <span className="ml-1.5 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white">Pro</span>
              )}
            </p>
          )}
        </div>
        <Link
          href="/tabs/new"
          className="btn-primary rounded-full px-5 py-2 text-sm font-semibold"
        >
          New tab
        </Link>
      </div>

      {loading && <p className="text-sm text-ink-500">Loading tabs…</p>}
      {error && <p className="text-sm text-ink-500">{error}</p>}

      {!loading && tabs.length === 0 && (
        <div className="rounded-3xl border border-sand-200 bg-white/70 p-8 text-center text-sm text-ink-500">
          You haven&apos;t started a tab yet. Create one to begin tracking.
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
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-ink-900">{tab.name}</h2>
                    {tab.isCreator ? (
                      <span className="rounded bg-ink-900 px-1.5 py-0.5 text-[10px] font-medium text-sand-50">
                        Owner
                      </span>
                    ) : (
                      <span className="rounded bg-sand-200 px-1.5 py-0.5 text-[10px] font-medium text-ink-500">
                        Member
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-500">
                    Started {tab.startDate} · {tab.status === "ACTIVE" ? "Active" : "Closed"}
                  </p>
                </div>
                {tab.status === "CLOSED" && progress ? (
                  <div className="flex items-center gap-3">
                    {isComplete && tab.isCreator && (
                      <button
                        onClick={(e) => handleArchive(e, tab.id)}
                        className="rounded-full border border-sand-200 px-3 py-1.5 text-xs font-medium hover:bg-sand-100 transition"
                      >
                        Archive
                      </button>
                    )}
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

      {/* Account section */}
      {user && (
        <div className="pt-4 border-t border-sand-200 flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="text-sm text-ink-400 hover:text-ink-700 hover:underline cursor-pointer transition"
          >
            Log out
          </button>
          <Link
            href="/tabs/archive"
            className="text-sm text-ink-400 hover:text-ink-700 hover:underline transition"
          >
            View archive
          </Link>
        </div>
      )}
    </div>
  );
}
