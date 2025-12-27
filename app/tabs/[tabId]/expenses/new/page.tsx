"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCents, formatCentsPlain, parseCents } from "@/lib/money/cents";
import { useToast } from "@/app/components/ToastProvider";

type Participant = {
  id: string;
  userId: string;
  displayName: string;
  netCents: number;
};

export default function NewExpensePage() {
  const params = useParams<{ tabId: string }>();
  const router = useRouter();
  const tabId = params?.tabId;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tabStatus, setTabStatus] = useState<"ACTIVE" | "CLOSED" | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [customSplit, setCustomSplit] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>({});
  const [splitParticipantIds, setSplitParticipantIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        setTabStatus(tabData.tab?.status ?? null);
        if (participantsData.participants?.length) {
          const meId = meData?.user?.id ?? null;
          const meParticipant = participantsData.participants.find(
            (participant: Participant) => participant.userId === meId,
          );
          setPaidBy(meParticipant?.id ?? participantsData.participants[0].id);
          setSplitParticipantIds(
            participantsData.participants.map((participant: Participant) => participant.id),
          );
        }
      })
      .catch(() => setError("Couldn't load participants."))
      .finally(() => setLoading(false));
  }, [tabId]);

  const amountCents = useMemo(() => {
    try {
      return parseCents(amount || "0");
    } catch {
      return 0;
    }
  }, [amount]);

  const splitSumCents = useMemo(() => {
    if (!customSplit) return 0;
    return participants.reduce((sum, participant) => {
      try {
        return sum + parseCents(splitAmounts[participant.id] || "0", true);
      } catch {
        return sum;
      }
    }, 0);
  }, [customSplit, participants, splitAmounts]);

  const canSubmit =
    tabStatus !== "CLOSED" &&
    amountCents > 0 &&
    (!customSplit || (splitSumCents === amountCents && splitParticipantIds.length > 0));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tabId) return;
    setSaving(true);
    setError(null);

    if (!canSubmit) {
      setError("Check the amount and split totals before saving.");
      setSaving(false);
      return;
    }

    let splits: { participantId: string; amountCents: number }[] | undefined;

    if (customSplit) {
      try {
        splits = participants.map((participant) => ({
          participantId: participant.id,
          amountCents: parseCents(splitAmounts[participant.id] || "0", true),
        }));
      } catch (err) {
        setError("Split amounts must be valid dollars and cents.");
        setSaving(false);
        return;
      }
    }

    const payload: Record<string, unknown> = {
      amount,
      note,
      paidByParticipantId: paidBy,
    };

    if (customSplit) {
      payload.splits = splits;
    } else {
      if (splitParticipantIds.length === 0) {
        setError("Select at least one participant to split.");
        setSaving(false);
        return;
      }
      payload.evenSplit = true;
      payload.splitParticipantIds = splitParticipantIds;
    }

    const res = await fetch(`/api/tabs/${tabId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message ?? "Could not save expense.");
      setSaving(false);
      return;
    }

    pushToast("Expense saved.");
    router.push(`/tabs/${tabId}`);
  };

  if (loading) {
    return <p className="text-sm text-ink-500">Loading…</p>;
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
        <h1 className="text-3xl font-semibold">Add expense</h1>
        <p className="text-sm text-ink-500">Log what was paid and how it's split.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-sand-200 bg-white/80 p-6">
        {tabStatus === "CLOSED" && (
          <p className="text-sm text-ink-500">This tab is closed. Expenses are read-only.</p>
        )}
        <label className="grid gap-2 text-sm">
          Amount
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            onBlur={(event) => {
              const value = event.target.value.trim();
              if (!value) return;
              try {
                const cents = parseCents(value);
                setAmount(formatCentsPlain(cents));
              } catch {
                setError("Amount must be a valid dollar value.");
              }
            }}
            className="rounded-2xl border border-sand-200 px-4 py-2"
            placeholder="128.50"
            required
            disabled={tabStatus === "CLOSED"}
          />
        </label>

        <label className="grid gap-2 text-sm">
          Note
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="rounded-2xl border border-sand-200 px-4 py-2"
            placeholder="Groceries, gas, etc."
            disabled={tabStatus === "CLOSED"}
          />
        </label>

        <label className="grid gap-2 text-sm">
          Paid by
          <select
            value={paidBy}
            onChange={(event) => setPaidBy(event.target.value)}
            className="rounded-2xl border border-sand-200 px-4 py-2"
            disabled={tabStatus === "CLOSED"}
          >
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.displayName}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-4 rounded-2xl border border-sand-200 bg-sand-50 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Split</p>
              <p className="text-xs text-ink-500">
                Even split is the default.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs text-ink-500">
              <input
                type="checkbox"
                checked={customSplit}
                onChange={(event) => setCustomSplit(event.target.checked)}
                disabled={tabStatus === "CLOSED"}
              />
              Custom
            </label>
          </div>

          {!customSplit && (
            <div className="space-y-3 text-sm text-ink-500">
              <p>Even split across selected people.</p>
              <p className="text-xs text-ink-500">
                Any remainder cent goes to the last participant in alphabetical order.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {participants.map((participant) => {
                  const selected = splitParticipantIds.includes(participant.id);
                  return (
                    <label key={participant.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          setSplitParticipantIds((prev) =>
                            selected
                              ? prev.filter((id) => id !== participant.id)
                              : [...prev, participant.id],
                          )
                        }
                        disabled={tabStatus === "CLOSED"}
                      />
                      {participant.displayName}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {customSplit && (
            <div className="grid gap-3">
              {participants.map((participant) => (
                <label key={participant.id} className="grid gap-1 text-xs text-ink-500">
                  {participant.displayName}
                    <input
                      value={splitAmounts[participant.id] ?? ""}
                      onChange={(event) =>
                        setSplitAmounts((prev) => ({
                          ...prev,
                          [participant.id]: event.target.value,
                        }))
                      }
                      onBlur={(event) => {
                        const value = event.target.value.trim();
                        if (!value) return;
                        try {
                          const cents = parseCents(value, true);
                          setSplitAmounts((prev) => ({
                            ...prev,
                            [participant.id]: formatCentsPlain(cents),
                          }));
                        } catch {
                          // Invalid input, leave as-is
                        }
                      }}
                      inputMode="decimal"
                      disabled={tabStatus === "CLOSED"}
                      className="rounded-xl border border-sand-200 px-3 py-2 text-sm text-ink-700"
                      placeholder="0.00"
                    />
                </label>
              ))}
              <p className="text-xs text-ink-500">
                Split total: {splitSumCents ? formatCents(splitSumCents) : "$0.00"}
              </p>
              {amountCents > 0 && (
                <p className="text-xs text-ink-500">
                  Remaining: {formatCents(amountCents - splitSumCents)}
                </p>
              )}
              {amountCents > 0 && splitSumCents !== amountCents && (
                <p className="text-xs text-ink-500">
                  Split total must match {formatCents(amountCents)}.
                </p>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-ink-500">{error}</p>}

        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="btn-primary w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save expense"}
        </button>
      </form>
    </div>
  );
}
