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
          <InviteButton tabId={tabId} />
        )}
      </div>

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
              </span>
              <div className="flex items-center gap-3">
                <span className="text-ink-500">
                  {participant.netCents === 0
                    ? "Even"
                    : participant.netCents > 0
                      ? `Owed ${formatCents(participant.netCents)}`
                      : `Owes ${formatCents(Math.abs(participant.netCents))}`}
                </span>
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
