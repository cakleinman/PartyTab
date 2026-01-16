"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AccessCard } from "@/app/components/AccessCard";

type TabInfo = {
  id: string;
  name: string;
  status: "ACTIVE" | "CLOSED";
};

export default function ClaimPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token;

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<{
    displayName: string;
    pin: string;
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/users/claim/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.displayName) {
          setDisplayName(data.displayName);
          setTabs(data.tabs ?? []);
        } else {
          setError(data?.error?.message ?? "Claim link not found.");
        }
      })
      .catch(() => {
        setError("Claim link not found.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleClaim = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setClaiming(true);
    setError(null);

    const res = await fetch(`/api/users/claim/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data?.error?.message ?? "Could not claim account.");
      setClaiming(false);
      return;
    }

    // Show access card with generated PIN
    setClaimSuccess({
      displayName: data.displayName,
      pin: data.pin,
    });
  };

  const handleContinue = () => {
    if (tabs.length === 1) {
      router.push(`/tabs/${tabs[0].id}`);
    } else {
      router.push("/tabs");
    }
  };

  if (loading) {
    return <p className="text-sm text-ink-500">Loading…</p>;
  }

  if (claimSuccess) {
    return (
      <div className="max-w-xl">
        <AccessCard
          displayName={claimSuccess.displayName}
          pin={claimSuccess.pin}
          onContinue={handleContinue}
        />
      </div>
    );
  }

  if (error && !displayName) {
    return (
      <div className="max-w-xl space-y-6">
        <h1 className="text-3xl font-semibold">Claim Account</h1>
        <p className="text-sm text-ink-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-semibold">Welcome, {displayName}!</h1>
      <p className="text-sm text-ink-500">
        Someone added you to a tab. Set a PIN to claim your account.
      </p>

      {tabs.length > 0 && (
        <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
          <p className="text-sm font-medium text-ink-700">
            You&apos;ve been added to:
          </p>
          <ul className="mt-2 space-y-1">
            {tabs.map((tab) => (
              <li key={tab.id} className="flex items-center gap-2 text-sm">
                <span className="text-ink-600">{tab.name}</span>
                {tab.status === "CLOSED" && (
                  <span className="rounded-full bg-sand-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-500">
                    Closed
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        onSubmit={handleClaim}
        className="space-y-5 rounded-3xl border border-sand-200 bg-white/80 p-6"
      >
        <p className="text-sm text-ink-500">
          We&apos;ll create a PIN for you to access your account from any device.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={claiming}
          className="btn-primary w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {claiming ? "Setting up…" : "Claim account"}
        </button>
      </form>
    </div>
  );
}
