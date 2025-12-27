"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCents } from "@/lib/money/cents";

type Participant = {
  id: string;
  displayName: string;
  netCents: number;
};

type TabDetail = {
  id: string;
  name: string;
  status: "ACTIVE" | "CLOSED";
  isCreator: boolean;
};

export default function CloseTabPage() {
  const params = useParams<{ tabId: string }>();
  const router = useRouter();
  const tabId = params?.tabId;
  const [tab, setTab] = useState<TabDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!tabId) return;
    Promise.all([
      fetch(`/api/tabs/${tabId}`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}/participants`).then((res) => res.json()),
    ])
      .then(([tabData, participantData]) => {
        if (tabData?.tab) {
          // If tab is already closed, redirect to settlement
          if (tabData.tab.status === "CLOSED") {
            router.replace(`/tabs/${tabId}/settlement`);
            return;
          }
          setTab(tabData.tab);
        } else {
          setError(tabData?.error?.message ?? "Tab not found.");
        }
        setParticipants(participantData?.participants ?? []);
      })
      .catch(() => setError("Tab not found."));
  }, [tabId, router]);

  const handleClose = async () => {
    if (!tabId) return;
    setClosing(true);
    setError(null);

    const res = await fetch(`/api/tabs/${tabId}/close`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message ?? "Could not close tab.");
      setClosing(false);
      return;
    }

    router.push(`/tabs/${tabId}/settlement`);
  };

  if (!tab) {
    return <p className="text-sm text-ink-500">{error ?? "Loading…"}</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <a href={`/tabs/${tabId}`} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tab
      </a>
      <div>
        <h1 className="text-3xl font-semibold">Close {tab.name}</h1>
        <p className="text-sm text-ink-500">
          Closing is permanent. Final transfers are calculated once.
        </p>
      </div>

      <div className="rounded-3xl border border-sand-200 bg-white/80 p-6">
        <h2 className="text-lg font-semibold">Net summary</h2>
        <div className="mt-4 grid gap-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm"
            >
              <span className="font-medium text-ink-700">{participant.displayName}</span>
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

      {error && <p className="text-sm text-ink-500">{error}</p>}

      {tab.isCreator ? (
        <button
          onClick={handleClose}
          disabled={closing || tab.status === "CLOSED"}
          className="btn-primary w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {tab.status === "CLOSED" ? "Tab already closed" : closing ? "Closing…" : "Confirm close"}
        </button>
      ) : (
        <p className="text-sm text-ink-500">Only the creator can close this tab.</p>
      )}
    </div>
  );
}
