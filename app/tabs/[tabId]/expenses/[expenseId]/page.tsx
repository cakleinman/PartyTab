"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCents, formatCentsPlain, parseCents } from "@/lib/money/cents";
import { useToast } from "@/app/components/ToastProvider";

type Participant = {
  id: string;
  displayName: string;
};

type ExpenseDetail = {
  id: string;
  amountTotalCents: number;
  note: string | null;
  paidByParticipantId: string;
  createdAt: string;
  createdByUserId: string;
  splits: { participantId: string; amountCents: number }[];
};

type TabInfo = {
  status: "ACTIVE" | "CLOSED";
  isCreator: boolean;
};

export default function ExpenseDetailPage() {
  const params = useParams<{ tabId: string; expenseId: string }>();
  const router = useRouter();
  const tabId = params?.tabId;
  const expenseId = params?.expenseId;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expense, setExpense] = useState<ExpenseDetail | null>(null);
  const [tab, setTab] = useState<TabInfo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [customSplit, setCustomSplit] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>({});
  const [splitParticipantIds, setSplitParticipantIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [amountCents, setAmountCents] = useState(0);
  const [splitSumCents, setSplitSumCents] = useState(0);
  const { pushToast } = useToast();

  useEffect(() => {
    if (!tabId || !expenseId) return;
    Promise.all([
      fetch(`/api/tabs/${tabId}/participants`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}/expenses/${expenseId}`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}`).then((res) => res.json()),
      fetch(`/api/me`).then((res) => res.json()),
    ])
      .then(([participantsData, expenseData, tabData, meData]) => {
        const loadedParticipants = participantsData.participants ?? [];
        setParticipants(loadedParticipants);
        setTab(tabData.tab ?? null);
        setUserId(meData?.user?.id ?? null);
        if (expenseData?.expense) {
          setExpense(expenseData.expense);
          const formattedAmount = formatCentsPlain(expenseData.expense.amountTotalCents);
          setAmount(formattedAmount);
          setAmountCents(expenseData.expense.amountTotalCents);
          setNote(expenseData.expense.note ?? "");
          setPaidBy(expenseData.expense.paidByParticipantId);
          const splitMap: Record<string, string> = {};
          const splitIds = expenseData.expense.splits.map(
            (split: { participantId: string; amountCents: number }) => split.participantId,
          );
          expenseData.expense.splits.forEach((split: { participantId: string; amountCents: number }) => {
            splitMap[split.participantId] = formatCentsPlain(split.amountCents);
          });
          const uniqueAmounts = new Set(
            expenseData.expense.splits.map((split: { amountCents: number }) => split.amountCents),
          );
          setCustomSplit(uniqueAmounts.size !== 1);
          setSplitParticipantIds(splitIds.length ? splitIds : loadedParticipants.map((p: Participant) => p.id));
          setSplitAmounts(splitMap);
        } else {
          setError(expenseData?.error?.message ?? "Expense not found.");
        }
      })
      .catch(() => setError("Expense not found."))
      .finally(() => setLoading(false));
  }, [tabId, expenseId]);

  useEffect(() => {
    try {
      setAmountCents(parseCents(amount || "0"));
    } catch {
      setAmountCents(0);
    }
  }, [amount]);

  useEffect(() => {
    if (!customSplit) {
      setSplitSumCents(0);
      return;
    }
    const sum = participants.reduce((total, participant) => {
      try {
        return total + parseCents(splitAmounts[participant.id] || "0");
      } catch {
        return total;
      }
    }, 0);
    setSplitSumCents(sum);
  }, [customSplit, participants, splitAmounts]);

  const tabStatus = tab?.status ?? null;
  const canSubmit =
    tabStatus !== "CLOSED" &&
    amountCents > 0 &&
    (!customSplit || (splitSumCents === amountCents && splitParticipantIds.length > 0));
  const canDelete =
    tabStatus === "ACTIVE" &&
    (expense?.createdByUserId === userId || tab?.isCreator);

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tabId || !expenseId) return;
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
          amountCents: parseCents(splitAmounts[participant.id] || "0"),
        }));
      } catch {
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

    const res = await fetch(`/api/tabs/${tabId}/expenses/${expenseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message ?? "Could not update expense.");
      setSaving(false);
      return;
    }

    setExpense({
      ...expense,
      ...data.expense,
      splits: splits ?? expense?.splits ?? [],
    });
    setSaving(false);
    pushToast("Expense updated.");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this expense? This cannot be undone.")) return;
    if (!tabId || !expenseId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/tabs/${tabId}/expenses/${expenseId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        pushToast(data?.error?.message ?? "Could not delete expense.");
        setDeleting(false);
        return;
      }

      pushToast("Expense deleted.");
      router.push(`/tabs/${tabId}`);
    } catch {
      pushToast("Network error deleting expense.");
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-ink-500">Loading…</p>;
  }

  if (error || !expense) {
    return <p className="text-sm text-ink-500">{error ?? "Expense not found."}</p>;
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
        <h1 className="text-3xl font-semibold">Expense detail</h1>
        <p className="text-sm text-ink-500">Edit is allowed only for the creator.</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6 rounded-3xl border border-sand-200 bg-white/80 p-6">
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
              <p className="text-xs text-ink-500">Even split is the default.</p>
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
            <p className="text-sm text-ink-500">
              Even split across {splitParticipantIds.length} people.
            </p>
          )}
          {!customSplit && (
            <p className="text-xs text-ink-500">
              Any remainder cent goes to the last participant in alphabetical order.
            </p>
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
          {!customSplit && (
            <div className="grid gap-2 text-xs text-ink-500 sm:grid-cols-2">
              {participants.map((participant) => {
                const selected = splitParticipantIds.includes(participant.id);
                return (
                  <label key={participant.id} className="flex items-center gap-2">
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
          )}
        </div>

        {error && <p className="text-sm text-ink-500">{error}</p>}

        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="btn-primary w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {saving ? "Saving…" : "Update expense"}
        </button>

        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full rounded-full border border-red-300 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete expense"}
          </button>
        )}
      </form>
    </div>
  );
}
