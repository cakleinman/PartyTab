"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCents, formatCentsPlain, parseCents } from "@/lib/money/cents";
import { useToast } from "@/app/components/ToastProvider";
import {
  SplitModeSelector,
  SplitPanel,
  ClaimPanel,
  CustomSplitPanel,
  type SplitMode,
  type ReceiptItem,
} from "@/app/components/split";

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

  // Data loading
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tabStatus, setTabStatus] = useState<"ACTIVE" | "CLOSED" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pushToast } = useToast();

  // Form fields
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paidBy, setPaidBy] = useState("");

  // Split mode state
  const [splitMode, setSplitMode] = useState<SplitMode>("split");
  const [splitParticipantIds, setSplitParticipantIds] = useState<string[]>([]);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>({});

  // Receipt items (will be populated when receipt is uploaded/parsed)
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);

  // Get current participant ID for claim panel
  const currentParticipantId = useMemo(() => {
    const participant = participants.find((p) => p.userId === currentUserId);
    return participant?.id ?? "";
  }, [participants, currentUserId]);

  useEffect(() => {
    if (!tabId) return;
    Promise.all([
      fetch(`/api/tabs/${tabId}/participants`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}`).then((res) => res.json()),
      fetch(`/api/me`).then((res) => res.json()),
    ])
      .then(([participantsData, tabData, meData]) => {
        const loadedParticipants = participantsData.participants ?? [];
        setParticipants(loadedParticipants);
        setTabStatus(tabData.tab?.status ?? null);
        setCurrentUserId(meData?.user?.id ?? null);

        if (loadedParticipants.length) {
          const meId = meData?.user?.id ?? null;
          const meParticipant = loadedParticipants.find(
            (participant: Participant) => participant.userId === meId
          );
          setPaidBy(meParticipant?.id ?? loadedParticipants[0].id);
          // NOTE: splitParticipantIds starts EMPTY (unchecked by default)
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
    if (splitMode !== "custom") return 0;
    return participants.reduce((sum, participant) => {
      try {
        return sum + parseCents(splitAmounts[participant.id] || "0", true);
      } catch {
        return sum;
      }
    }, 0);
  }, [splitMode, participants, splitAmounts]);

  // Calculate totals from claim mode
  const claimTotals = useMemo(() => {
    if (splitMode !== "claim") return {};
    const totals: Record<string, number> = {};
    receiptItems.forEach((item) => {
      if (item.claimedBy.length > 0) {
        const splitAmount = Math.floor(item.priceCents / item.claimedBy.length);
        item.claimedBy.forEach((claim) => {
          totals[claim.participantId] =
            (totals[claim.participantId] || 0) + splitAmount;
        });
      }
    });
    return totals;
  }, [splitMode, receiptItems]);

  const canSubmit = useMemo(() => {
    if (tabStatus === "CLOSED") return false;
    if (amountCents <= 0) return false;

    switch (splitMode) {
      case "split":
        return splitParticipantIds.length > 0;
      case "custom":
        return splitSumCents === amountCents;
      case "claim":
        // At least one item must be claimed
        return receiptItems.some((item) => item.claimedBy.length > 0);
      default:
        return false;
    }
  }, [
    tabStatus,
    amountCents,
    splitMode,
    splitParticipantIds,
    splitSumCents,
    receiptItems,
  ]);

  const handleClaimToggle = (itemId: string, participantId: string) => {
    setReceiptItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const isClaimed = item.claimedBy.some(
          (c) => c.participantId === participantId
        );
        const participant = participants.find((p) => p.id === participantId);

        if (isClaimed) {
          return {
            ...item,
            claimedBy: item.claimedBy.filter(
              (c) => c.participantId !== participantId
            ),
          };
        } else {
          return {
            ...item,
            claimedBy: [
              ...item.claimedBy,
              {
                participantId,
                displayName: participant?.displayName ?? "Unknown",
              },
            ],
          };
        }
      })
    );
  };

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

    const payload: Record<string, unknown> = {
      amount,
      note,
      date,
      paidByParticipantId: paidBy,
    };

    if (splitMode === "custom") {
      try {
        const splits = participants.map((participant) => ({
          participantId: participant.id,
          amountCents: parseCents(splitAmounts[participant.id] || "0", true),
        }));
        payload.splits = splits;
      } catch {
        setError("Split amounts must be valid dollars and cents.");
        setSaving(false);
        return;
      }
    } else if (splitMode === "claim") {
      // Convert claim totals to splits
      const splits = Object.entries(claimTotals).map(
        ([participantId, amountCents]) => ({
          participantId,
          amountCents,
        })
      );
      payload.splits = splits;
    } else {
      // Even split mode
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

  const isDisabled = tabStatus === "CLOSED";
  const hasReceiptItems = receiptItems.length > 0;

  return (
    <div className="max-w-2xl space-y-6">
      <a
        href={`/tabs/${tabId}`}
        className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to tab
      </a>
      <div>
        <h1 className="text-3xl font-semibold">Add expense</h1>
        <p className="text-sm text-ink-500">
          Log what was paid and how it's split.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-sand-200 bg-white/80 p-6"
      >
        {tabStatus === "CLOSED" && (
          <p className="text-sm text-ink-500">
            This tab is closed. Expenses are read-only.
          </p>
        )}

        <label className="grid gap-2 text-sm">
          Amount
          <input
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow numbers and one decimal point
              if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                setAmount(value);
              }
            }}
            inputMode="decimal"
            onBlur={(e) => {
              const value = e.target.value.trim();
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
            disabled={isDisabled}
          />
        </label>

        <label className="grid gap-2 text-sm">
          Note
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-2xl border border-sand-200 px-4 py-2"
            placeholder="Groceries, gas, etc."
            disabled={isDisabled}
          />
        </label>

        <label className="grid gap-2 text-sm">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-2xl border border-sand-200 px-4 py-2"
            disabled={isDisabled}
          />
        </label>

        <label className="grid gap-2 text-sm">
          Paid by
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="rounded-2xl border border-sand-200 px-4 py-2"
            disabled={isDisabled}
          >
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.displayName}
              </option>
            ))}
          </select>
        </label>

        {/* Split Section */}
        <div className="space-y-4 rounded-2xl border border-sand-200 bg-sand-50 px-4 py-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold">How to split</p>
            <SplitModeSelector
              mode={splitMode}
              onChange={setSplitMode}
              hasReceiptItems={hasReceiptItems}
              disabled={isDisabled}
            />
          </div>

          <div className="pt-2">
            {splitMode === "split" && (
              <SplitPanel
                participants={participants}
                selectedIds={splitParticipantIds}
                onSelectionChange={setSplitParticipantIds}
                totalCents={amountCents}
                disabled={isDisabled}
              />
            )}

            {splitMode === "claim" && (
              <ClaimPanel
                items={receiptItems}
                participants={participants}
                currentParticipantId={currentParticipantId}
                onClaimToggle={handleClaimToggle}
                disabled={isDisabled}
              />
            )}

            {splitMode === "custom" && (
              <CustomSplitPanel
                participants={participants}
                splitAmounts={splitAmounts}
                onSplitAmountsChange={setSplitAmounts}
                totalCents={amountCents}
                disabled={isDisabled}
              />
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

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
