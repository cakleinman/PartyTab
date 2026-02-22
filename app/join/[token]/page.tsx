"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InfoTooltip } from "@/app/components/InfoTooltip";
import { AccessCard } from "@/app/components/AccessCard";

type UnclaimedParticipant = {
  participantId: string;
  userId: string;
  displayName: string;
};

export default function JoinPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token;
  const [tabName, setTabName] = useState<string | null>(null);
  const [tabStatus, setTabStatus] = useState<"ACTIVE" | "CLOSED" | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [hasUser, setHasUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<{
    displayName: string;
    pin: string;
    tabId: string;
  } | null>(null);

  // Picker state
  const [unclaimedParticipants, setUnclaimedParticipants] = useState<UnclaimedParticipant[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<string | "new" | null>(null);
  const [pickerConfirmed, setPickerConfirmed] = useState(false);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`/api/invites/${token}`).then((res) => res.json()),
      fetch("/api/me").then((res) => res.json()),
    ])
      .then(([inviteData, meData]) => {
        if (inviteData?.tab?.name) {
          setTabName(inviteData.tab.name);
          setTabStatus(inviteData.tab.status);
          const unclaimed: UnclaimedParticipant[] = inviteData.unclaimedParticipants ?? [];
          if (unclaimed.length > 0) {
            setUnclaimedParticipants(unclaimed);
          }

          // Auto-select matching unclaimed participant based on session display name
          const userName: string | null = meData?.user?.displayName ?? null;
          if (userName && unclaimed.length > 0) {
            const match = unclaimed.find((p: UnclaimedParticipant) =>
              fuzzyNameMatch(userName, p.displayName),
            );
            if (match) {
              setSelectedClaim(match.participantId);
            }
          }
        } else {
          setError(inviteData?.error?.message ?? "Invite not found.");
        }
        if (meData?.user?.id) {
          setHasUser(true);
          // If user already has session and tab is closed, go straight to settlement
          if (inviteData?.tab?.status === "CLOSED" && inviteData?.tab?.id) {
            router.push(`/tabs/${inviteData.tab.id}/settlement`);
          }
        }
      })
      .catch(() => {
        setError("Invite not found.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, router]);

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setJoining(true);
    setError(null);

    const payload: Record<string, unknown> = {};

    // If claiming an unclaimed participant
    if (selectedClaim && selectedClaim !== "new") {
      payload.claimParticipantId = selectedClaim;
    } else if (!hasUser) {
      payload.displayName = displayName;
      payload.pin = pin;
    }

    const res = await fetch(`/api/invites/${token}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message ?? "Could not join.");
      setJoining(false);
      return;
    }

    // Claim flow: merged into existing account (no PIN)
    if (data.claimed && !data.pin) {
      router.push(`/tabs/${data.tabId}`);
      return;
    }

    // Show access card for new users with generated PIN
    if (data.pin) {
      setJoinSuccess({
        displayName: data.displayName,
        pin: data.pin,
        tabId: data.tabId,
      });
      return;
    }

    // Redirect to settlement if tab is closed, otherwise to tab dashboard
    if (data.redirectToSettlement) {
      router.push(`/tabs/${data.tabId}/settlement`);
    } else {
      router.push(`/tabs/${data.tabId}`);
    }
  };

  const handleContinue = () => {
    if (joinSuccess) {
      router.push(`/tabs/${joinSuccess.tabId}`);
    }
  };

  if (joinSuccess) {
    return (
      <div className="max-w-xl">
        <AccessCard
          displayName={joinSuccess.displayName}
          pin={joinSuccess.pin}
          onContinue={handleContinue}
        />
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-ink-500">Loading invite…</p>;
  }

  if (error && !tabName) {
    return <p className="text-sm text-ink-500">{error}</p>;
  }

  // Tab is closed - show verification form for existing participants
  if (tabStatus === "CLOSED") {
    return (
      <div className="max-w-xl space-y-6">
        <h1 className="text-3xl font-semibold">{tabName}</h1>
        <div className="rounded-2xl border-2 border-ink-900 bg-white p-4">
          <p className="font-medium">This tab is closed and ready to settle.</p>
          <p className="mt-1 text-sm text-ink-500">
            Verify your identity to view your settlement details.
          </p>
        </div>
        <form onSubmit={handleJoin} className="space-y-5 rounded-3xl border border-sand-200 bg-white/80 p-6">
          <p className="text-sm text-ink-500">
            Enter the name and PIN you used when you joined this tab.
          </p>
          <label className="grid gap-2 text-sm">
            <span>
              Display name
              <InfoTooltip text="The name you used when you first joined this tab." />
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
              <InfoTooltip text="The 4-digit PIN you created when you joined." />
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
            disabled={joining}
            className="btn-primary w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {joining ? "Verifying…" : "View settlement"}
          </button>
        </form>
      </div>
    );
  }

  // Show picker step if there are unclaimed participants and picker hasn't been confirmed
  if (unclaimedParticipants.length > 0 && !pickerConfirmed) {
    return (
      <div className="max-w-xl space-y-6">
        <h1 className="text-3xl font-semibold">Join {tabName}</h1>
        <div className="space-y-4 rounded-3xl border border-sand-200 bg-white/80 p-6">
          <p className="text-sm font-medium text-ink-700">
            Were you already added to this tab?
          </p>
          <div className="space-y-2">
            {unclaimedParticipants.map((p) => (
              <label
                key={p.participantId}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                  selectedClaim === p.participantId
                    ? "border-ink-900 bg-ink-900/5"
                    : "border-sand-200 hover:border-sand-300"
                }`}
              >
                <input
                  type="radio"
                  name="claimPicker"
                  value={p.participantId}
                  checked={selectedClaim === p.participantId}
                  onChange={() => setSelectedClaim(p.participantId)}
                  className="accent-ink-900"
                />
                <span className="text-sm font-medium">{p.displayName}</span>
              </label>
            ))}
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                selectedClaim === "new"
                  ? "border-ink-900 bg-ink-900/5"
                  : "border-sand-200 hover:border-sand-300"
              }`}
            >
              <input
                type="radio"
                name="claimPicker"
                value="new"
                checked={selectedClaim === "new"}
                onChange={() => setSelectedClaim("new")}
                className="accent-ink-900"
              />
              <span className="text-sm font-medium">I&apos;m someone new</span>
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={() => {
              if (selectedClaim === "new") {
                setPickerConfirmed(true);
              } else if (selectedClaim) {
                // Submit claim directly
                handleJoin(new Event("submit") as unknown as React.FormEvent);
              }
            }}
            disabled={!selectedClaim || joining}
            className="btn-primary w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {joining ? "Joining…" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-semibold">Join {tabName}</h1>
      <p className="text-sm text-ink-500">
        Add your name and you&apos;re in. No payments, just tracking.
      </p>
      <form onSubmit={handleJoin} className="space-y-5 rounded-3xl border border-sand-200 bg-white/80 p-6">
        {!hasUser && (
          <label className="grid gap-2 text-sm">
            <span>
              Display name
              <InfoTooltip text="Your name as shown to other participants in this tab. Choose something they'll recognize you by." />
            </span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="rounded-2xl border border-sand-200 px-4 py-2"
              required
            />
          </label>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={joining}
          className="btn-primary w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {joining ? "Joining…" : "Join tab"}
        </button>
      </form>
    </div>
  );
}

/** Check if two names fuzzy-match (case-insensitive word overlap) */
function fuzzyNameMatch(a: string, b: string): boolean {
  const wordsA = a.toLowerCase().split(/\s+/);
  const wordsB = b.toLowerCase().split(/\s+/);
  return wordsA.some((w) => wordsB.includes(w)) || wordsB.some((w) => wordsA.includes(w));
}
