"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatCentsPlain, parseCents } from "@/lib/money/cents";
import { useToast } from "@/app/components/ToastProvider";
import { ProPreviewModal } from "@/app/components/ProPreviewModal";
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
  const [hasProFeatures, setHasProFeatures] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProPreview, setShowProPreview] = useState(false);
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

  // Receipt upload state (for claim mode)
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Add participant inline
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [addingParticipant, setAddingParticipant] = useState(false);

  // Tip state (for receipt/claim mode)
  const [tipMode, setTipMode] = useState<"percent" | "amount">("percent");
  const [tipValue, setTipValue] = useState("");

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
        setHasProFeatures(tabData.tab?.hasProFeatures ?? false);
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

    switch (splitMode) {
      case "split":
        return amountCents > 0 && splitParticipantIds.length > 0;
      case "custom":
        return amountCents > 0 && splitSumCents === amountCents;
      case "claim":
        // Allow saving with receipt file even without amount (will be parsed)
        if (receiptFile) return true;
        // Or if we have claimed items with an amount
        if (amountCents > 0 && receiptItems.some((item) => item.claimedBy.length > 0)) return true;
        return false;
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
    receiptFile,
  ]);

  // Handle receipt file selection (creates local preview)
  const handleReceiptUpload = (file: File) => {
    setReceiptFile(file);
    const url = URL.createObjectURL(file);
    setReceiptPreviewUrl(url);
  };

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

  const handleAddParticipant = async (event?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    event?.preventDefault();
    if (!tabId || !newParticipantName.trim()) return;

    setAddingParticipant(true);
    try {
      const res = await fetch(`/api/tabs/${tabId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: newParticipantName.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        pushToast(data?.error?.message ?? "Could not add person.");
        return;
      }

      // Add new participant to list
      setParticipants((prev) => [...prev, data.participant]);
      setNewParticipantName("");
      setShowAddParticipant(false);
      pushToast(`${data.participant.displayName} added!`);
    } catch {
      pushToast("Network error adding person.");
    } finally {
      setAddingParticipant(false);
    }
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

    // Calculate tip in cents for receipt mode
    const calculateTipCents = (): number => {
      if (!tipValue || tipValue === "0") return 0;
      const tipNum = parseFloat(tipValue);
      if (isNaN(tipNum) || tipNum <= 0) return 0;

      if (tipMode === "amount") {
        // Direct dollar amount
        return Math.round(tipNum * 100);
      } else {
        // Percentage - but we don't know receipt total yet, so store as-is
        // The API will need to handle this after parsing
        // For now, we'll pass the percentage and let the expense detail page handle it
        // Actually, we can't calculate % without knowing the total...
        // So we'll pass both tipPercent and tipAmount, and API uses what it can
        return 0; // Will be calculated after receipt is parsed
      }
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
      if (receiptItems.length > 0) {
        // Convert claim totals to splits
        const splits = Object.entries(claimTotals).map(
          ([participantId, amountCents]) => ({
            participantId,
            amountCents,
          })
        );
        payload.splits = splits;
      } else if (receiptFile) {
        // Receipt mode - amount will be populated after parsing
        payload.receiptMode = true;
        // For percentage tip, we need to calculate after receipt is parsed
        // For fixed amount tip, we can calculate now
        if (tipMode === "amount" && tipValue) {
          payload.tipCents = calculateTipCents();
        } else if (tipMode === "percent" && tipValue) {
          // Store tip percentage - will be calculated after parsing on the detail page
          // For now, we'll store it but the parse endpoint will need the receipt total
          // Actually, let's simplify: require user to enter tip as $ amount for now
          // Or we can calculate based on a rough estimate
          payload.tipPercent = parseFloat(tipValue) || 0;
        }
        payload.evenSplit = true;
        payload.splitParticipantIds = participants.map((p) => p.id);
      } else {
        // No items yet - use even split as placeholder, will be updated after parsing
        payload.evenSplit = true;
        payload.splitParticipantIds = participants.map((p) => p.id);
      }
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

    const expenseId = data.expense?.id;

    // If claim mode with receipt file, upload and parse it
    if (splitMode === "claim" && receiptFile && expenseId) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", receiptFile);

      const uploadRes = await fetch(
        `/api/tabs/${tabId}/expenses/${expenseId}/receipt`,
        { method: "POST", body: formData }
      );

      if (uploadRes.ok) {
        setIsUploading(false);
        setIsParsing(true);
        // Parse the receipt
        await fetch(
          `/api/tabs/${tabId}/expenses/${expenseId}/receipt/parse`,
          { method: "POST" }
        );
        setIsParsing(false);
      }

      // Redirect to expense detail page to claim items
      pushToast("Receipt uploaded! Claim your items.");
      router.push(`/tabs/${tabId}/expenses/${expenseId}`);
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
      <Link
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
      </Link>
      <div>
        <h1 className="text-3xl font-semibold">Add expense</h1>
        <p className="text-sm text-ink-500">
          Log what was paid and how it&apos;s split.
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
              hasProFeatures={hasProFeatures}
              onProPreview={() => setShowProPreview(true)}
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
                onReceiptUpload={handleReceiptUpload}
                uploadedReceipt={receiptPreviewUrl ? { url: receiptPreviewUrl } : null}
                isUploading={isUploading}
                isParsing={isParsing}
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

          {/* Add participant inline */}
          {!isDisabled && (
            <div className="border-t border-sand-200 pt-3">
              {showAddParticipant ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newParticipantName}
                    onChange={(e) => setNewParticipantName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddParticipant();
                      }
                    }}
                    placeholder="Name"
                    className="flex-1 rounded-xl border border-sand-200 px-3 py-2 text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleAddParticipant()}
                    disabled={addingParticipant || !newParticipantName.trim()}
                    className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {addingParticipant ? "…" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddParticipant(false);
                      setNewParticipantName("");
                    }}
                    className="rounded-xl border border-sand-200 px-3 py-2 text-sm text-ink-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddParticipant(true)}
                  className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add person to tab
                </button>
              )}
            </div>
          )}
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

      <ProPreviewModal
        isOpen={showProPreview}
        onClose={() => setShowProPreview(false)}
      />
    </div>
  );
}
