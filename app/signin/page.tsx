"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InfoTooltip } from "@/app/components/InfoTooltip";

export default function SignInPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  // Check if already signed in
  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.id) {
          router.push("/home");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSigning(true);
    setError(null);

    const res = await fetch("/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, pin }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data?.error?.message ?? "Could not sign in.");
      setSigning(false);
      return;
    }

    router.push("/home");
  };

  if (loading) {
    return <p className="text-sm text-ink-500">Loading...</p>;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="text-sm text-ink-500">
          Enter the name and PIN you used when you joined a tab.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-sand-200 bg-white/80 p-6">
        <label className="grid gap-2 text-sm">
          <span>
            Display name
            <InfoTooltip text="The name you used when you first joined or created a tab." />
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
            <InfoTooltip text="The 4-digit PIN you created." />
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={signing}
          className="btn-primary w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {signing ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-ink-500">
        Don&apos;t have an account?{" "}
        <a href="/tabs/new" className="font-medium text-ink-700 underline">
          Create a tab
        </a>{" "}
        or join one via invite link.
      </p>
    </div>
  );
}
