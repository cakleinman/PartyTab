"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCents, formatCentsPlain, parseCents } from "@/lib/money/cents";
import { useToast } from "@/app/components/ToastProvider";
import { ReceiptUpload, type ReceiptItem } from "@/app/components/ReceiptUpload";

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

// Generate unique initials for participants
function getUniqueInitials(participants: Participant[]): Record<string, string> {
  const initialsMap: Record<string, string> = {};
  const usedInitials: Record<string, string[]> = {}; // initial -> [participantIds]

  // First pass: generate basic initials
  participants.forEach((p) => {
    const words = p.displayName.trim().split(/\s+/);
    let initials = words.map((w) => w[0]?.toUpperCase() || "").join("").slice(0, 2);
    if (!initials) initials = "??";

    initialsMap[p.id] = initials;
    if (!usedInitials[initials]) usedInitials[initials] = [];
    usedInitials[initials].push(p.id);
  });

  // Second pass: disambiguate duplicates
  Object.entries(usedInitials).forEach(([initials, ids]) => {
    if (ids.length > 1) {
      ids.forEach((id, index) => {
        const p = participants.find((p) => p.id === id);
        if (!p) return;
        const firstName = p.displayName.split(/\s+/)[0] || "";
        // Try first 2 chars of first name
        let newInitials = firstName.slice(0, 2).toUpperCase();
        // If still not unique or same as before, add number
        if (newInitials === initials || ids.some((otherId, otherIdx) => {
          if (otherIdx === index) return false;
          const otherP = participants.find((p) => p.id === otherId);
          return otherP?.displayName.slice(0, 2).toUpperCase() === newInitials;
        })) {
          newInitials = firstName[0]?.toUpperCase() + (index + 1);
        }
        initialsMap[id] = newInitials;
      });
    }
  });

  return initialsMap;
}

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
  const { pushToast } = useToast();

  // Memoize unique initials
  const uniqueInitials = useMemo(() => getUniqueInitials(participants), [participants]);

  // Calculate tip in cents based on current mode and value
  const calculatedTipCents = useMemo(() => {
    const val = parseFloat(tipValue) || 0;
    if (tipMode === "percent" && expense?.receiptSubtotalCents) {
      return Math.round((expense.receiptSubtotalCents * val) / 100);
    } else if (tipMode === "amount") {
      return Math.round(val * 100);
    }
    return 0;
  }, [tipMode, tipValue, expense?.receiptSubtotalCents]);

  // Auto-compute the total for receipt-based expenses as a derived value
  // This replaces the useEffect that was calling setAmount
  const receiptComputedTotal = useMemo(() => {
    if (!expense?.receiptSubtotalCents) return null;
    const subtotal = expense.receiptSubtotalCents;
    const tax = expense.receiptTaxCents || 0;
    const fees = expense.receiptFeeCents || 0;
    return subtotal + tax + fees + calculatedTipCents;
  }, [calculatedTipCents, expense?.receiptSubtotalCents, expense?.receiptTaxCents, expense?.receiptFeeCents]);

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
      date,
      paidByParticipantId: paidBy,
    };

    // Include tip if there's a receipt
    if (receipt || receiptItems.length > 0) {
      payload.tipMode = tipMode;
      payload.tipValue = tipValue;
    }

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
          <div className="space-y-3 rounded-2xl border border-sand-200 bg-sand-50 px-4 py-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold">Receipt Items</p>
                <p className="text-xs text-ink-500">
                  Tap initials to claim. Shared items split evenly.
                </p>
              </div>
              <div className="flex gap-1">
                {expense?.receiptTaxCents && expense.receiptTaxCents > 0 && (
                  <p className="text-xs text-ink-500 bg-sand-100 px-2 py-1 rounded-lg">
                    +{formatCents(expense.receiptTaxCents)} tax
                  </p>
                )}
                {expense?.receiptFeeCents && expense.receiptFeeCents > 0 && (
                  <p className="text-xs text-ink-500 bg-sand-100 px-2 py-1 rounded-lg">
                    +{formatCents(expense.receiptFeeCents)} fees
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {receiptItems.map((item) => {
                const handleClaimToggle = async (participantId: string) => {
                  const isClaimed = item.claimedBy.some(
                    (c) => c.participantId === participantId
                  );
                  const method = isClaimed ? "DELETE" : "POST";
                  const res = await fetch(
                    `/api/tabs/${tabId}/expenses/${expenseId}/receipt/items/${item.id}/claims`,
                    {
                      method,
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ participantId }),
                    }
                  );
                  const data = await res.json();
                  if (res.ok && data.item) {
                    setReceiptItems((prev) =>
                      prev.map((i) => (i.id === item.id ? data.item : i))
                    );
                  }
                };

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-sand-200 bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-ink-500">
                          <span>{formatCents(item.priceCents)}</span>
                          {item.quantity > 1 && <span>× {item.quantity}</span>}
                        </div>
                      </div>
                    </div>
                    {/* Participant claim buttons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {participants.map((participant) => {
                        const isClaimed = item.claimedBy.some(
                          (c) => c.participantId === participant.id
                        );
                        return (
                          <button
                            key={participant.id}
                            type="button"
                            onClick={() => handleClaimToggle(participant.id)}
                            disabled={!canEdit}
                            title={participant.displayName}
                            className={`w-8 h-8 rounded-full text-xs font-medium transition flex items-center justify-center ${isClaimed
                              ? "bg-ink-900 text-white"
                              : "bg-sand-100 text-ink-400 hover:bg-sand-200"
                              } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {uniqueInitials[participant.id] || "?"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Split summary with tax and tip distribution */}
            {(() => {
              const totals: Record<string, number> = {};
              let itemSubtotal = 0;
              receiptItems.forEach((item) => {
                if (item.claimedBy.length > 0) {
                  const splitAmount = Math.floor(item.priceCents / item.claimedBy.length);
                  item.claimedBy.forEach((claim) => {
                    totals[claim.participantId] = (totals[claim.participantId] || 0) + splitAmount;
                    itemSubtotal += splitAmount;
                  });
                }
              });
              // Add proportional tax
              const taxCents = expense?.receiptTaxCents || 0;
              const feeCents = expense?.receiptFeeCents || 0;
              const baseSubtotal = expense?.receiptSubtotalCents || itemSubtotal;
              if (taxCents > 0 && itemSubtotal > 0) {
                Object.keys(totals).forEach((participantId) => {
                  const share = totals[participantId] / baseSubtotal;
                  totals[participantId] += Math.round(share * taxCents);
                });
              }
              // Add proportional fees
              if (feeCents > 0 && itemSubtotal > 0) {
                Object.keys(totals).forEach((participantId) => {
                  const share = totals[participantId] / (itemSubtotal + taxCents);
                  totals[participantId] += Math.round(share * feeCents);
                });
              }
              // Add proportional tip - use calculated tip from user input for real-time preview
              const tipCents = calculatedTipCents;
              if (tipCents > 0 && itemSubtotal > 0) {
                Object.keys(totals).forEach((participantId) => {
                  const share = totals[participantId] / (itemSubtotal + taxCents + feeCents);
                  totals[participantId] += Math.round(share * tipCents);
                });
              }
              const hasAnyClaims = Object.keys(totals).length > 0;
              if (!hasAnyClaims) return null;
              const extras: string[] = [];
              if (taxCents > 0) extras.push(`${formatCents(taxCents)} tax`);
              if (feeCents > 0) extras.push(`${formatCents(feeCents)} fees`);
              if (tipCents > 0) extras.push(`${formatCents(tipCents)} tip`);
              return (
                <div className="rounded-xl bg-sand-100 p-3 space-y-1 mt-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium text-ink-700">Split Summary</p>
                    {extras.length > 0 && (
                      <p className="text-xs text-ink-500">incl. {extras.join(", ")}</p>
                    )}
                  </div>
                  {participants
                    .filter((p) => totals[p.id])
                    .map((participant) => (
                      <div key={participant.id} className="flex justify-between text-xs text-ink-600">
                        <span>{participant.displayName}</span>
                        <span>{formatCents(totals[participant.id])}</span>
                      </div>
                    ))}
                </div>
              );
            })()}
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
