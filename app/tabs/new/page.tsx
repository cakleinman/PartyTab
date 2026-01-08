"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InfoTooltip } from "@/app/components/InfoTooltip";

function NewTabForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [hasUser, setHasUser] = useState(false);
  const [name, setName] = useState(() => searchParams.get("name") || "");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.id) {
          setHasUser(true);
        }
      })
      .catch(() => {
        setHasUser(false);
      });
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload: Record<string, unknown> = {
      name,
      description,
      startDate: startDate || undefined,
    };
    if (!hasUser) {
      payload.displayName = displayName;
      payload.pin = pin;
    }

    const response = await fetch("/api/tabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data?.error?.message ?? "Could not create tab.");
      setLoading(false);
      return;
    }

    router.push(`/tabs/${data.tab.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-sand-200 bg-white/80 p-6">
      {!hasUser && (
        <>
          <label className="grid gap-2 text-sm">
            <span>
              Display name
              <InfoTooltip text="Your name as shown to other participants. This is how people in this tab will see you." />
            </span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="rounded-2xl border border-sand-200 px-4 py-2"
              required
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span>
              PIN
              <InfoTooltip text="A 4-digit code to identify you. Use this same name + PIN to access your account from another device." />
            </span>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              className="rounded-2xl border border-sand-200 px-4 py-2"
              placeholder="4 digits"
              required
            />
          </label>
        </>
      )}
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
