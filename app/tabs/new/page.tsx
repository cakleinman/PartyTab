"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { InfoTooltip } from "@/app/components/InfoTooltip";

type UserInfo = {
  id: string;
  subscriptionTier: "GUEST" | "BASIC" | "PRO";
} | null;

type TabGroup = {
  tabId: string;
  tabName: string;
  participants: { userId: string; displayName: string }[];
};

function NewTabForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserInfo>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [name, setName] = useState(() => searchParams.get("name") || "");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<TabGroup[]>([]);
  const [copyFromTabId, setCopyFromTabId] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.id) {
          setUser(data.user);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  useEffect(() => {
    if (user && user.subscriptionTier !== "GUEST") {
      fetch("/api/tabs/groups")
        .then((res) => res.json())
        .then((data) => setGroups(data.groups ?? []))
        .catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/tabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        startDate: startDate || undefined,
        copyFromTabId: copyFromTabId || undefined,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data?.error?.message ?? "Could not create tab.");
      setLoading(false);
      return;
    }

    router.push(`/tabs/${data.tab.id}`);
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/tabs/new" });
  };

  // Loading state
  if (checkingAuth) {
    return (
      <div className="h-64 rounded-3xl border border-sand-200 bg-white/80 animate-pulse" />
    );
  }

  // Not logged in or guest - show upgrade prompt
  if (!user || user.subscriptionTier === "GUEST") {
    return (
      <div className="space-y-6 rounded-3xl border border-sand-200 bg-white/80 p-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sand-100">
            <svg className="h-6 w-6 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Sign in to create tabs</h2>
          <p className="text-sm text-ink-500">
            Creating tabs is free! Just sign in with Google or email.
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 rounded-full border border-sand-200 bg-white px-6 py-3 text-sm font-medium hover:bg-sand-50 transition"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <Link
          href="/register"
          className="block w-full text-center text-sm text-ink-500 hover:text-ink-700 underline"
        >
          or sign up with email
        </Link>

        {user?.subscriptionTier === "GUEST" && (
          <p className="text-center text-xs text-ink-400">
            You&apos;re currently signed in as a guest. Guests can join tabs but not create them.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-sand-200 bg-white/80 p-6">
      <label className="grid gap-2 text-sm">
        <span>
          Tab name
          <InfoTooltip text="A name for this shared expense group, like 'Beach Trip 2025' or 'Friday Dinner'. All participants will see this." />
        </span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-2xl border border-sand-200 px-4 py-2"
          required
        />
      </label>
      {groups.length > 0 && (
        <label className="grid gap-2 text-sm">
          <span>
            Start with group from
            <InfoTooltip text="Copy participants from a previous tab. You can always add or remove people after creating." />
          </span>
          <select
            value={copyFromTabId}
            onChange={(e) => setCopyFromTabId(e.target.value)}
            className="rounded-2xl border border-sand-200 px-4 py-2 bg-white"
          >
            <option value="">New group</option>
            {groups.map((g) => (
              <option key={g.tabId} value={g.tabId}>
                {g.tabName} ({g.participants.length} {g.participants.length === 1 ? "person" : "people"})
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="grid gap-2 text-sm">
        Description (optional)
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-[90px] rounded-2xl border border-sand-200 px-4 py-2"
        />
      </label>
      <label className="grid gap-2 text-sm">
        Start date (optional)
        <input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="rounded-2xl border border-sand-200 px-4 py-2"
        />
      </label>

      {error && <p className="text-sm text-ink-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create tab"}
      </button>
    </form>
  );
}

export default function NewTabPage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Create a new tab</h1>
        <p className="text-sm text-ink-500">
          Set the basics. Invite people after it&apos;s created.
        </p>
      </div>

      <Suspense fallback={<div className="h-96 rounded-3xl border border-sand-200 bg-white/80 animate-pulse" />}>
        <NewTabForm />
      </Suspense>
    </div>
  );
}
