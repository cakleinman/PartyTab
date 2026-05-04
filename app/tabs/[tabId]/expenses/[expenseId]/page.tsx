"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCents, formatCentsPlain, parseCents } from "@/lib/money/cents";
import { computeClaimSplits } from "@/lib/receipts/computeClaimSplits";
import { useToast } from "@/app/components/ToastProvider";
import { ReceiptUpload, type ReceiptItem } from "@/app/components/ReceiptUpload";
import { ClaimPanel } from "@/app/components/split";

type Participant = {
  id: string;
  displayName: string;
};

type ReceiptData = {
  path: string;
  url: string;
} | null;

type ExpenseDetail = {
  id: string;
  amountTotalCents: number;
  note: string | null;
  date: string;
  paidByParticipantId: string;
  createdAt: string;
  createdByUserId: string;
  isEstimate: boolean;
  receiptSubtotalCents?: number | null;
  receiptTaxCents?: number | null;
  receiptFeeCents?: number | null;
  receiptTipCents?: number | null;
  receiptTipPercent?: number | null;
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
  const [date, setDate] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [isEstimate, setIsEstimate] = useState(false);
  const [customSplit, setCustomSplit] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>({});
  const [splitParticipantIds, setSplitParticipantIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData>(null);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [tipMode, setTipMode] = useState<"percent" | "amount">("percent");
  const [tipValue, setTipValue] = useState("");
  // Editable tax/fee — initialized from expense, persisted on save
  const [taxCents, setTaxCents] = useState(0);
  const [feeCents, setFeeCents] = useState(0);
  const { pushToast } = useToast();

  // Effective subtotal — prefer the receipt's parsed subtotal when present,
  // otherwise derive from items (manual-entry expenses without an AI parse).
  const effectiveSubtotalCents = useMemo(() => {
    if (expense?.receiptSubtotalCents && expense.receiptSubtotalCents > 0) {
      return expense.receiptSubtotalCents;
    }
    return receiptItems.reduce((sum, item) => sum + item.priceCents, 0);
  }, [expense?.receiptSubtotalCents, receiptItems]);

  // Calculate tip in cents based on current mode and value
  const calculatedTipCents = useMemo(() => {
    const val = parseFloat(tipValue) || 0;
    if (tipMode === "percent" && effectiveSubtotalCents > 0) {
      return Math.round((effectiveSubtotalCents * val) / 100);
    } else if (tipMode === "amount") {
      return Math.round(val * 100);
    }
    return 0;
  }, [tipMode, tipValue, effectiveSubtotalCents]);

  // Auto-compute the total for receipt-based expenses as a derived value
  // This replaces the useEffect that was calling setAmount
  const receiptComputedTotal = useMemo(() => {
    if (effectiveSubtotalCents === 0) return null;
    return effectiveSubtotalCents + taxCents + feeCents + calculatedTipCents;
  }, [calculatedTipCents, effectiveSubtotalCents, taxCents, feeCents]);

  // Sync amount when receipt total changes (only update if different to avoid loops)
  const prevReceiptTotal = useRef<number | null>(null);
  useEffect(() => {
    if (receiptComputedTotal !== null && receiptComputedTotal !== prevReceiptTotal.current) {
      prevReceiptTotal.current = receiptComputedTotal;
      const formattedTotal = formatCentsPlain(receiptComputedTotal);
      // Intentionally syncing derived state - amount must reflect receipt total
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAmount((prev) => (prev !== formattedTotal ? formattedTotal : prev));
    }
  }, [receiptComputedTotal]);

  useEffect(() => {
    if (!tabId || !expenseId) return;
    Promise.all([
      fetch(`/api/tabs/${tabId}/participants`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}/expenses/${expenseId}`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}`).then((res) => res.json()),
      fetch(`/api/me`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}/expenses/${expenseId}/receipt`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}/expenses/${expenseId}/receipt/items`).then((res) => res.json()),
    ])
      .then(([participantsData, expenseData, tabData, meData, receiptData, itemsData]) => {
        setReceipt(receiptData?.receipt ?? null);
        setReceiptItems(itemsData?.items ?? []);
        const loadedParticipants = participantsData.participants ?? [];
        setParticipants(loadedParticipants);
        setTab(tabData.tab ?? null);
        setUserId(meData?.user?.id ?? null);
        if (expenseData?.expense) {
          setExpense(expenseData.expense);
          const formattedAmount = formatCentsPlain(expenseData.expense.amountTotalCents);
          setAmount(formattedAmount);
          setNote(expenseData.expense.note ?? "");
          setDate(expenseData.expense.date ?? "");
          setPaidBy(expenseData.expense.paidByParticipantId);
          setIsEstimate(expenseData.expense.isEstimate ?? false);
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
          // Initialize tip state
          if (expenseData.expense.receiptTipPercent != null) {
            setTipMode("percent");
            setTipValue(String(expenseData.expense.receiptTipPercent));
          } else if (expenseData.expense.receiptTipCents != null && expenseData.expense.receiptTipCents > 0) {
            setTipMode("amount");
            setTipValue(formatCentsPlain(expenseData.expense.receiptTipCents));
          }
          // Initialize tax/fee state — editable on this page
          setTaxCents(expenseData.expense.receiptTaxCents ?? 0);
          setFeeCents(expenseData.expense.receiptFeeCents ?? 0);
        } else {
          setError(expenseData?.error?.message ?? "Expense not found.");
        }
      })
      .catch(() => setError("Expense not found."))
      .finally(() => setLoading(false));
  }, [tabId, expenseId]);

  const amountCents = useMemo(() => {
    try {
      return parseCents(amount || "0");
    } catch {
      return 0;
    }
  }, [amount]);

  const splitSumCents = useMemo(() => {
    if (!customSplit) {
      return 0;
    }
    return participants.reduce((total, participant) => {
      try {
        return total + parseCents(splitAmounts[participant.id] || "0");
      } catch {
        return total;
      }
    }, 0);
  }, [customSplit, participants, splitAmounts]);

  const tabStatus = tab?.status ?? null;
  const canEdit =
    tabStatus === "ACTIVE" &&
    (expense?.createdByUserId === userId || tab?.isCreator);
  const canSubmit =
    canEdit &&
    amountCents > 0 &&
    // For receipt-based expenses, claims determine the split
    (receiptItems.length > 0 ||
      !customSplit ||
      (splitSumCents === amountCents && splitParticipantIds.length > 0));
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

    const isReceiptBased = receiptItems.length > 0;

    if (isReceiptBased) {
      splits = computeClaimSplits({
        items: receiptItems,
        taxCents,
        feeCents,
        tipCents: calculatedTipCents,
      });
      if (splits.length === 0) {
        setError("Claim at least one item before saving.");
        setSaving(false);
        return;
      }
    } else if (customSplit) {
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
      date,
      paidByParticipantId: paidBy,
      isEstimate,
    };

    // Include tip if there's a receipt
    if (receipt || receiptItems.length > 0) {
      payload.tipMode = tipMode;
      payload.tipValue = tipValue;
    }

    // Persist editable tax/fee + manual subtotal so future edits start from
    // the same numbers the user just confirmed.
    if (isReceiptBased) {
      payload.receiptTaxCents = taxCents;
      payload.receiptFeeCents = feeCents;
      // Only set subtotal explicitly when there's no parsed receipt to
      // preserve as the source of truth.
      if (!expense?.receiptSubtotalCents) {
        payload.receiptSubtotalCents = receiptItems.reduce(
          (s, item) => s + item.priceCents,
          0,
        );
      }
    }

    if (isReceiptBased && splits) {
      // For claim-driven expenses, the stored total is the sum of claimed splits.
      // Unclaimed items are dropped from the total — claim them to include.
      const claimTotal = splits.reduce((sum, s) => sum + s.amountCents, 0);
      payload.amount = formatCentsPlain(claimTotal);
      payload.splits = splits;
    } else if (customSplit) {
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

  // Manual item add/edit/delete — immediate persistence (vs. new-expense
   // which stages changes until Save). Mirrors the existing claim-toggle
   // behavior on this page.
  const handleClaimToggle = async (itemId: string, participantId: string) => {
    const item = receiptItems.find((it) => it.id === itemId);
    if (!item) return;
    const isClaimed = item.claimedBy.some((c) => c.participantId === participantId);
    const method = isClaimed ? "DELETE" : "POST";
    const res = await fetch(
      `/api/tabs/${tabId}/expenses/${expenseId}/receipt/items/${itemId}/claims`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      },
    );
    const data = await res.json();
    if (res.ok && data.item) {
      setReceiptItems((prev) =>
        prev.map((it) => (it.id === itemId ? data.item : it)),
      );
    } else if (!res.ok) {
      pushToast(data?.error?.message ?? "Could not update claim.");
    }
  };

  const handleAddItem = async (name: string, priceCents: number, quantity: number) => {
    if (!tabId || !expenseId) return;
    const res = await fetch(
      `/api/tabs/${tabId}/expenses/${expenseId}/receipt/items`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, priceCents, quantity }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message ?? "Failed to add item");
    }
    setReceiptItems((prev) => [...prev, data.item]);
  };

  const handleEditItem = async (
    itemId: string,
    updates: { name?: string; priceCents?: number; quantity?: number },
  ) => {
    if (!tabId || !expenseId) return;
    const res = await fetch(
      `/api/tabs/${tabId}/expenses/${expenseId}/receipt/items/${itemId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message ?? "Failed to update item");
    }
    setReceiptItems((prev) =>
      prev.map((it) => (it.id === itemId ? data.item : it)),
    );
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!tabId || !expenseId) return;
    const res = await fetch(
      `/api/tabs/${tabId}/expenses/${expenseId}/receipt/items/${itemId}`,
      { method: "DELETE", headers: { "Content-Type": "application/json" } },
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error?.message ?? "Failed to delete item");
    }
    setReceiptItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleConfirmEstimate = async () => {
    if (!tabId || !expenseId) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/tabs/${tabId}/expenses/${expenseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isEstimate: false }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message ?? "Could not confirm expense.");
      setSaving(false);
      return;
    }
    setIsEstimate(false);
    setExpense((prev) => prev ? { ...prev, isEstimate: false } : prev);
    setSaving(false);
    pushToast("Expense confirmed");
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
        <p className="text-sm text-ink-500">Edit is allowed for the expense creator or tab owner.</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6 rounded-3xl border border-sand-200 bg-white/80 p-6">
        {!canEdit && (
          <p className="text-sm text-ink-500">
            {tabStatus === "CLOSED" ? "This tab is closed. Expenses are read-only." : "You cannot edit this expense."}
          </p>
        )}
        <label className="grid gap-2 text-sm">
          Amount
          <input
            value={amount}
            onChange={(event) => {
              const value = event.target.value;
              // Only allow numbers and one decimal point
              if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                setAmount(value);
              }
            }}
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
            disabled={!canEdit}
          />
        </label>

        <div className="flex items-start gap-3 rounded-2xl border border-sand-200 px-4 py-3">
          <input
            id="isEstimate"
            type="checkbox"
            checked={isEstimate}
            onChange={(e) => setIsEstimate(e.target.checked)}
            disabled={!canEdit}
            className="mt-0.5"
          />
          <label htmlFor="isEstimate" className="grid gap-0.5 text-sm cursor-pointer">
            This is an estimate
            {isEstimate && (
              <span className="text-xs text-ink-500">Estimated amounts aren&apos;t finalized yet</span>
            )}
          </label>
        </div>

        <label className="grid gap-2 text-sm">
          Note
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="rounded-2xl border border-sand-200 px-4 py-2"
            disabled={!canEdit}
          />
        </label>

        <label className="grid gap-2 text-sm">
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-2xl border border-sand-200 px-4 py-2"
            disabled={!canEdit}
          />
        </label>

        <label className="grid gap-2 text-sm">
          Paid by
          <select
            value={paidBy}
            onChange={(event) => setPaidBy(event.target.value)}
            className="rounded-2xl border border-sand-200 px-4 py-2"
            disabled={!canEdit}
          >
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.displayName}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2">
          <p className="text-sm font-medium">Receipt</p>
          <ReceiptUpload
            tabId={tabId!}
            expenseId={expenseId!}
            initialReceipt={receipt}
            onUploadComplete={(r) => {
              setReceipt(r);
              pushToast("Receipt uploaded.");
            }}
            onDelete={() => {
              setReceipt(null);
              setReceiptItems([]);
              pushToast("Receipt removed.");
            }}
            onParseComplete={(items, parsed) => {
              setReceiptItems(items);
              // Auto-update amount from parsed receipt total
              if (parsed?.totalCents) {
                setAmount(formatCentsPlain(parsed.totalCents));
              }
              pushToast(`Parsed ${items.length} items.`);
            }}
            disabled={!canEdit}
          />
        </div>

        {receiptItems.length > 0 && (
          <div className="rounded-2xl border border-sand-200 bg-sand-50 px-4 py-4">
            <ClaimPanel
              items={receiptItems}
              participants={participants}
              currentParticipantId=""
              onClaimToggle={handleClaimToggle}
              onItemAdd={canEdit ? handleAddItem : undefined}
              onItemEdit={canEdit ? handleEditItem : undefined}
              onItemDelete={canEdit ? handleDeleteItem : undefined}
              disabled={!canEdit}
              subtotalCents={effectiveSubtotalCents}
              taxCents={taxCents}
              feeCents={feeCents}
              tipCents={calculatedTipCents}
            />
          </div>
        )}

        {/* Tip section - shown when there's a receipt */}
        {(receipt || receiptItems.length > 0) && (
          <div className="rounded-2xl border border-sand-200 bg-sand-50 px-4 py-4 space-y-3">
            <p className="text-sm font-semibold">Tip</p>
            <div className="flex gap-2">
              <div className="flex rounded-lg border border-sand-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setTipMode("percent")}
                  disabled={!canEdit}
                  className={`px-3 py-1.5 text-sm font-medium transition ${tipMode === "percent"
                    ? "bg-ink-900 text-white"
                    : "bg-white text-ink-500 hover:bg-sand-50"
                    } ${!canEdit ? "opacity-50" : ""}`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setTipMode("amount")}
                  disabled={!canEdit}
                  className={`px-3 py-1.5 text-sm font-medium transition ${tipMode === "amount"
                    ? "bg-ink-900 text-white"
                    : "bg-white text-ink-500 hover:bg-sand-50"
                    } ${!canEdit ? "opacity-50" : ""}`}
                >
                  $
                </button>
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={tipValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                    setTipValue(value);
                  }
                }}
                placeholder={tipMode === "percent" ? "20" : "15.00"}
                className="flex-1 rounded-xl border border-sand-200 px-3 py-2 text-sm"
                disabled={!canEdit}
              />
            </div>
            <p className="text-xs text-ink-400">
              {tipMode === "percent"
                ? `Tip: ${tipValue || 0}% of subtotal (${formatCents(calculatedTipCents)})`
                : `Tip: ${formatCents(calculatedTipCents)}`}
            </p>
          </div>
        )}

        {/* Editable tax & fees — shown alongside tip when receipt items exist */}
        {receiptItems.length > 0 && (
          <div className="rounded-2xl border border-sand-200 bg-sand-50 px-4 py-4 space-y-3">
            <p className="text-sm font-semibold">Tax &amp; fees</p>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-ink-500 w-10 shrink-0">Tax</span>
              <span className="text-sm text-ink-400">$</span>
              <input
                type="text"
                inputMode="decimal"
                aria-label="Tax amount"
                value={taxCents > 0 ? (taxCents / 100).toFixed(2) : ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^[0-9]*\.?[0-9]{0,2}$/.test(v)) {
                    const n = parseFloat(v);
                    setTaxCents(isFinite(n) && n >= 0 ? Math.round(n * 100) : 0);
                  }
                }}
                placeholder="0.00"
                disabled={!canEdit}
                className="flex-1 min-w-0 rounded-lg border border-sand-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-ink-500 w-10 shrink-0">Fees</span>
              <span className="text-sm text-ink-400">$</span>
              <input
                type="text"
                inputMode="decimal"
                aria-label="Fees amount"
                value={feeCents > 0 ? (feeCents / 100).toFixed(2) : ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^[0-9]*\.?[0-9]{0,2}$/.test(v)) {
                    const n = parseFloat(v);
                    setFeeCents(isFinite(n) && n >= 0 ? Math.round(n * 100) : 0);
                  }
                }}
                placeholder="0.00"
                disabled={!canEdit}
                className="flex-1 min-w-0 rounded-lg border border-sand-200 px-3 py-2 text-sm"
              />
            </div>
            <p className="text-xs text-ink-400">
              Saved on next update. Distributes proportionally across claimed items.
            </p>
          </div>
        )}

        {/* Hide split section when using claim mode (receipt items exist) */}
        {receiptItems.length === 0 && (
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
                  disabled={!canEdit}
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
                      disabled={!canEdit}
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
                        disabled={!canEdit}
                      />
                      {participant.displayName}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-ink-500">{error}</p>}

        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="btn-primary w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {saving ? "Saving…" : "Update expense"}
        </button>

        {isEstimate && canEdit && (
          <button
            type="button"
            onClick={handleConfirmEstimate}
            disabled={saving}
            className="w-full rounded-full border border-ink-300 px-6 py-3 text-sm font-semibold text-ink-700 hover:bg-sand-50 disabled:opacity-50"
          >
            Confirm estimate
          </button>
        )}

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
