"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatCents } from "@/lib/money/cents";
import { useToast } from "@/app/components/ToastProvider";
import { InviteButton } from "@/app/components/InviteButton";

type Participant = {
  id: string;
  userId: string;
  displayName: string;
  netCents: number;
  isPlaceholder?: boolean;
  claimUrl?: string;
};

type TabInfo = {
  status: "ACTIVE" | "CLOSED";
  isCreator: boolean;
};

export default function ParticipantsPage() {
  const params = useParams<{ tabId: string }>();
  const tabId = params?.tabId;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tab, setTab] = useState<TabInfo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const { pushToast } = useToast();

  // Add person state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);

  useEffect(() => {
    if (!tabId) return;
    Promise.all([
      fetch(`/api/tabs/${tabId}/participants`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}`).then((res) => res.json()),
      fetch(`/api/me`).then((res) => res.json()),
    ])
      .then(([participantsData, tabData, meData]) => {
        setParticipants(participantsData.participants ?? []);
        setTab(tabData.tab ?? null);
        setUserId(meData?.user?.id ?? null);
      })
      .catch(() => {
        setError("Couldn't load participants.");
        pushToast("Network error loading participants.");
      })
      .finally(() => setLoading(false));
  }, [tabId]);

  const handleRemove = async (participantId: string, displayName: string) => {
    if (!confirm(`Remove ${displayName} from this tab?`)) return;

    setRemoving(participantId);
    try {
      const res = await fetch(`/api/tabs/${tabId}/participants/${participantId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        pushToast(data?.error?.message ?? "Could not remove participant.");
        return;
      }

      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      pushToast(`${displayName} removed.`);
    } catch {
      pushToast("Network error removing participant.");
    } finally {
      setRemoving(null);
    }
  };

  const handleAddPerson = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tabId || !newName.trim()) return;

    setAdding(true);
    try {
      const res = await fetch(`/api/tabs/${tabId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: newName.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        pushToast(data?.error?.message ?? "Could not add person.");
        return;
      }

      // Add new participant to list
      setParticipants((prev) => [...prev, data.participant]);
      setClaimUrl(data.claimUrl);
      setLastAddedName(data.participant.displayName);
      setNewName("");
      pushToast(`${data.participant.displayName} added!`);
    } catch {
      pushToast("Network error adding person.");
    } finally {
      setAdding(false);
    }
  };

  const copyClaimUrl = async (url?: string) => {
    const urlToCopy = url || claimUrl;
    if (!urlToCopy) return;
    try {
      await navigator.clipboard.writeText(urlToCopy);
      pushToast("Claim link copied!");
    } catch {
      pushToast("Could not copy link.");
    }
  };

  if (loading) {
    return <p className="text-sm text-ink-500">Loading participants…</p>;
  }

  return (
    <div className="space-y-6">
      <a href={`/tabs/${tabId}`} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tab
      </a>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Participants</h1>
          <p className="text-sm text-ink-500">Net balances so far.</p>
        </div>
        {tab?.status === "ACTIVE" && tabId && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setClaimUrl(null);
                setLastAddedName(null);
              }}
              className="rounded-full border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-sand-100"
            >
              {showAddForm ? "Cancel" : "Add person"}
            </button>
            <InviteButton tabId={tabId} />
          </div>
        )}
      </div>

      {/* Add person form */}
      {showAddForm && tab?.status === "ACTIVE" && (
        <div className="rounded-2xl border border-sand-200 bg-white/80 p-4 space-y-4">
          <form onSubmit={handleAddPerson} className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Person's name"
              className="flex-1 rounded-xl border border-sand-200 px-4 py-2 text-sm"
              required
            />
            <button
              type="submit"
              disabled={adding || !newName.trim()}
              className="btn-primary rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </form>
          <p className="text-xs text-ink-500">
            Add someone who isn&apos;t here yet. They can claim their account later with a link you share.
          </p>

          {/* Claim URL display */}
          {claimUrl && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 space-y-2">
              <p className="text-sm font-medium text-green-800">
                {lastAddedName} added! Share this link with them:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={claimUrl}
                  readOnly
                  className="flex-1 rounded-lg border border-green-200 bg-white px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => copyClaimUrl()}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-ink-500">{error}</p>}

      <div className="grid gap-3">
        {participants.map((participant) => {
          const isYou = participant.userId === userId;
          const canRemove = tab?.isCreator && tab?.status === "ACTIVE" && !isYou;

          return (
            <div
              key={participant.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white/80 px-4 py-3 text-sm"
            >
              <span className="font-medium text-ink-700">
                {participant.displayName}
                {isYou && (
                  <span className="ml-2 rounded-full border border-ink-300 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-500">
                    You
                  </span>
                )}
                {participant.isPlaceholder && (
                  <span className="ml-2 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-700">
                    Unclaimed
                  </span>
                )}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-ink-500">
                  {participant.netCents === 0
                    ? "Even"
                    : participant.netCents > 0
                      ? `Owed ${formatCents(participant.netCents)}`
                      : `Owes ${formatCents(Math.abs(participant.netCents))}`}
                </span>
                {participant.isPlaceholder && participant.claimUrl && (
                  <button
                    type="button"
                    onClick={() => copyClaimUrl(participant.claimUrl)}
                    className="rounded-lg border border-ink-200 px-2 py-1 text-[10px] font-medium text-ink-500 hover:bg-sand-100"
                    title="Copy invite link"
                  >
                    Copy link
                  </button>
                )}
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => handleRemove(participant.id, participant.displayName)}
                    disabled={removing === participant.id}
                    className="text-ink-400 hover:text-red-600 disabled:opacity-50"
                    title="Remove participant"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
