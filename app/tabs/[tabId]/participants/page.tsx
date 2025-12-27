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
};

export default function ParticipantsPage() {
  const params = useParams<{ tabId: string }>();
  const tabId = params?.tabId;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tab, setTab] = useState<TabInfo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between rounded-2xl border border-sand-200 bg-white/80 px-4 py-3 text-sm"
          >
            <span className="font-medium text-ink-700">
              {participant.displayName}
              {participant.userId === userId && (
                <span className="ml-2 rounded-full border border-ink-300 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-500">
                  You
                </span>
              )}
            </span>
            <span className="text-ink-500">
              {participant.netCents === 0
                ? "Even so far"
                : participant.netCents > 0
                  ? `You're owed ${formatCents(participant.netCents)}`
                  : `You owe ${formatCents(Math.abs(participant.netCents))}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
