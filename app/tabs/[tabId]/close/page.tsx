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
  const [estimateCount, setEstimateCount] = useState(0);
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
          setEstimateCount(tabData.tab.estimateCount ?? 0);
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

  const handleConvertAndClose = async () => {
    if (!tabId) return;
    setClosing(true);
    setError(null);

    const res = await fetch(`/api/tabs/${tabId}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ convertEstimates: true }),
    });
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
        <div className="space-y-3">
          {estimateCount > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-medium text-amber-800">
                {estimateCount} expense{estimateCount > 1 ? "s are" : " is"} still estimated
              </p>
              <p className="mt-1 text-xs text-amber-700">
                You can finalize them first, or convert all to confirmed.
              </p>
            </div>
          )}
          {estimateCount > 0 && (
            <button
              onClick={handleConvertAndClose}
              disabled={closing || tab.status === "CLOSED"}
              className="btn-secondary w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {closing ? "Closing…" : "Convert all estimates and close"}
            </button>
          )}
          <button
            onClick={handleClose}
            disabled={closing || tab.status === "CLOSED"}
            className="btn-primary w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {tab.status === "CLOSED" ? "Tab already closed" : closing ? "Closing…" : "Confirm close"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-ink-500">Only the creator can close this tab.</p>
      )}
    </div>
  );
}
