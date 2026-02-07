"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatCents, formatCentsPlain, parseCents } from "@/lib/money/cents";
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
  const [splitMode, setSplitModeInternal] = useState<SplitMode>("split");
  const [splitParticipantIds, setSplitParticipantIds] = useState<string[]>([]);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>({});
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Wrap setSplitMode to persist to sessionStorage (handles mobile camera eviction)
  const setSplitMode = (mode: SplitMode) => {
    setSplitModeInternal(mode);
    if (typeof window !== "undefined" && tabId) {
      sessionStorage.setItem(`expense-mode-${tabId}`, mode);
    }
  };

  // Restore split mode from sessionStorage on mount (handles mobile camera return)
  useEffect(() => {
    if (!tabId || hasRestoredState) return;
    const saved = sessionStorage.getItem(`expense-mode-${tabId}`);
    if (saved === "claim" || saved === "custom" || saved === "split") {
      setSplitModeInternal(saved);
    }
    setHasRestoredState(true);
  }, [tabId, hasRestoredState]);

  // Receipt items (will be populated when receipt is uploaded/parsed)
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);

  // Receipt upload state (for claim mode)
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [receiptExpenseId, setReceiptExpenseIdInternal] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Wrap setReceiptExpenseId to persist to sessionStorage
  const setReceiptExpenseId = (id: string | null) => {
    setReceiptExpenseIdInternal(id);
    if (typeof window !== "undefined" && tabId) {
      if (id) {
        sessionStorage.setItem(`expense-receipt-id-${tabId}`, id);
      } else {
        sessionStorage.removeItem(`expense-receipt-id-${tabId}`);
      }
    }
  };

  // Restore receiptExpenseId from sessionStorage on mount
  useEffect(() => {
    if (!tabId || hasRestoredState) return;
    const savedExpenseId = sessionStorage.getItem(`expense-receipt-id-${tabId}`);
    if (savedExpenseId) {
      setReceiptExpenseIdInternal(savedExpenseId);
    }
  }, [tabId, hasRestoredState]);

  // Add participant inline
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [addingParticipant, setAddingParticipant] = useState(false);

  // Tip state (for receipt/claim mode)
  const [tipMode, setTipMode] = useState<"percent" | "amount">("percent");
  const [tipValue, setTipValue] = useState("");

  // Receipt parsed totals (for calculating tip and total)
  const [receiptSubtotalCents, setReceiptSubtotalCents] = useState(0);
  const [receiptTaxCents, setReceiptTaxCents] = useState(0);
  const [receiptFeeCents, setReceiptFeeCents] = useState(0);

  // Get current participant ID for claim panel
  const currentParticipantId = useMemo(() => {
    const participant = participants.find((p) => p.userId === currentUserId);
    return participant?.id ?? "";
  }, [participants, currentUserId]);

  // Calculate tip in cents based on current mode and value
  const calculatedTipCents = useMemo(() => {
    const val = parseFloat(tipValue) || 0;
    if (tipMode === "percent" && receiptSubtotalCents > 0) {
      return Math.round((receiptSubtotalCents * val) / 100);
    } else if (tipMode === "amount") {
      return Math.round(val * 100);
    }
    return 0;
  }, [tipMode, tipValue, receiptSubtotalCents]);

  // Auto-update amount when tip changes for receipt-based expenses
  useEffect(() => {
    if (splitMode !== "claim" || receiptSubtotalCents === 0) return;
    const total = receiptSubtotalCents + receiptTaxCents + receiptFeeCents + calculatedTipCents;
    setAmount(formatCentsPlain(total));
  }, [calculatedTipCents, receiptSubtotalCents, receiptTaxCents, receiptFeeCents, splitMode]);

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

  // Restore receipt data if returning from camera (mobile browser eviction)
  useEffect(() => {
    if (!tabId || !receiptExpenseId || receiptItems.length > 0) return;

    // Fetch existing receipt items for the saved expense
    fetch(`/api/tabs/${tabId}/expenses/${receiptExpenseId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data?.expense) return;
        const expense = data.expense;

        // Restore receipt URL for preview
        if (expense.receiptUrl) {
          setReceiptPreviewUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/${expense.receiptUrl}`);
        }

        // Restore receipt items if already parsed
        if (expense.receiptItems?.length > 0) {
          setReceiptItems(expense.receiptItems.map((item: { id: string; name: string; priceCents: number; quantity: number; claims?: { participantId: string; participant?: { user?: { displayName?: string } } }[] }) => ({
            id: item.id,
            name: item.name,
            priceCents: item.priceCents,
            quantity: item.quantity,
            claimedBy: (item.claims || []).map((c: { participantId: string; participant?: { user?: { displayName?: string } } }) => ({
              participantId: c.participantId,
              displayName: c.participant?.user?.displayName || "Unknown",
            })),
          })));
        }

        // Restore parsed totals
        if (expense.receiptSubtotalCents) setReceiptSubtotalCents(expense.receiptSubtotalCents);
        if (expense.receiptTaxCents) setReceiptTaxCents(expense.receiptTaxCents);
        if (expense.receiptFeeCents) setReceiptFeeCents(expense.receiptFeeCents);
        if (expense.amountTotalCents) setAmount(formatCentsPlain(expense.amountTotalCents));
        if (expense.note) setNote(expense.note);
      })
      .catch((err) => console.error("Failed to restore receipt data:", err));
  }, [tabId, receiptExpenseId, receiptItems.length]);

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
        // If expense was already created from receipt, allow saving
        if (receiptExpenseId) return true;
        // If receipt has items, allow (even without claims - can claim on detail page)
        if (receiptItems.length > 0) return true;
        // If uploading/parsing, don't allow yet
        if (isUploading || isParsing) return false;
        // If receipt file exists but not yet processed, allow to start processing
        if (receiptFile) return true;
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
    receiptExpenseId,
    isUploading,
    isParsing,
  ]);

  // Handle receipt file selection - create expense, upload, and parse immediately
  const handleReceiptUpload = async (file: File) => {
    if (!tabId || !paidBy) return;

    // Show preview immediately
    setReceiptFile(file);
    const url = URL.createObjectURL(file);
    setReceiptPreviewUrl(url);
    setError(null);
    setIsUploading(true);

    try {
      // Create expense with receiptMode flag (allows amount=0)
      const createRes = await fetch(`/api/tabs/${tabId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: "0.01",
          note: note || "Receipt expense",
          date,
          paidByParticipantId: paidBy,
          receiptMode: true,
          evenSplit: true,
          splitParticipantIds: participants.map((p) => p.id),
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        setError(data?.error?.message ?? "Could not create expense.");
        setIsUploading(false);
        return;
      }

      const { expense } = await createRes.json();
      setReceiptExpenseId(expense.id);

      // Upload the receipt
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(
        `/api/tabs/${tabId}/expenses/${expense.id}/receipt`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        setError(data?.error?.message ?? "Failed to upload receipt.");
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
      setIsParsing(true);

      // Parse the receipt
      const parseRes = await fetch(
        `/api/tabs/${tabId}/expenses/${expense.id}/receipt/parse`,
        { method: "POST" }
      );

      if (parseRes.ok) {
        const parseData = await parseRes.json();
        setReceiptItems(parseData.items || []);

        // Store parsed receipt totals for tip calculation
        const subtotal = parseData.parsed?.subtotalCents || 0;
        const tax = parseData.parsed?.taxCents || 0;
        const fees = parseData.parsed?.feeCents || 0;
        setReceiptSubtotalCents(subtotal);
        setReceiptTaxCents(tax);
        setReceiptFeeCents(fees);

        // Auto-fill amount from parsed total (without tip initially)
        if (parseData.parsed?.totalCents) {
          const totalAmount = formatCentsPlain(parseData.parsed.totalCents);
          setAmount(totalAmount);

          // Update the expense with the real amount
          await fetch(`/api/tabs/${tabId}/expenses/${expense.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: totalAmount }),
          });
        }

        pushToast(`Parsed ${parseData.items?.length || 0} items!`);
      } else {
        let errorMsg = "Could not parse receipt";
        try {
          const parseError = await parseRes.json();
          console.error("Parse failed:", parseError);
          errorMsg = parseError?.error?.message || errorMsg;
        } catch {
          console.error("Parse failed with status:", parseRes.status);
        }
        setError(errorMsg);
        pushToast(errorMsg);
      }

      setIsParsing(false);
    } catch (err) {
      console.error("Receipt processing error:", err);
      const message = err instanceof Error ? err.message : "Failed to process receipt";
      setError(message);
      setIsUploading(false);
      setIsParsing(false);
    }
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

    // If expense was already created from receipt upload, update with tip and claims
    if (receiptExpenseId) {
      try {
        // Update expense with tip and final amount
        const updatePayload: Record<string, unknown> = {
          amount,
          note,
        };
        if (tipValue) {
          updatePayload.tipMode = tipMode;
          updatePayload.tipValue = tipValue;
        }
        await fetch(`/api/tabs/${tabId}/expenses/${receiptExpenseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });

        // Save all claims
        for (const item of receiptItems) {
          for (const claim of item.claimedBy) {
            await fetch(
              `/api/tabs/${tabId}/expenses/${receiptExpenseId}/receipt/items/${item.id}/claims`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participantId: claim.participantId }),
              }
            );
          }
        }

        // Clear session storage for this expense flow
        sessionStorage.removeItem(`expense-mode-${tabId}`);
        sessionStorage.removeItem(`expense-receipt-id-${tabId}`);
        pushToast("Expense saved!");
        router.push(`/tabs/${tabId}`);
      } catch (err) {
        console.error("Failed to save expense:", err);
        setError("Failed to save expense.");
        setSaving(false);
      }
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
        // For percentage, calculate from the current amount
        // The amount should be the receipt total at this point
        return Math.round(amountCents * (tipNum / 100));
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
      } else {
        // Even split as default
        payload.evenSplit = true;
        payload.splitParticipantIds = participants.map((p) => p.id);
      }

      // Add tip info if receipt was uploaded
      if (receiptFile && tipValue) {
        if (tipMode === "amount") {
          payload.tipCents = calculateTipCents();
        } else {
          payload.tipPercent = parseFloat(tipValue) || 0;
        }
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

    // Clear session storage for this expense flow
    sessionStorage.removeItem(`expense-mode-${tabId}`);
    sessionStorage.removeItem(`expense-receipt-id-${tabId}`);
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
              <>
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
                  subtotalCents={receiptSubtotalCents}
                  taxCents={receiptTaxCents}
                  feeCents={receiptFeeCents}
                  tipCents={calculatedTipCents}
                />

                {/* Tip input - shown when receipt is uploaded */}
                {receiptFile && (
                  <div className="mt-4 rounded-2xl border border-sand-200 bg-sand-50 px-4 py-4 space-y-3">
                    <p className="text-sm font-semibold">Add tip (optional)</p>
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => setTipMode("percent")}
                        className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition ${
                          tipMode === "percent"
                            ? "bg-ink-900 text-white"
                            : "bg-white text-ink-600 border border-sand-200 hover:bg-sand-100"
                        }`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipMode("amount")}
                        className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition ${
                          tipMode === "amount"
                            ? "bg-ink-900 text-white"
                            : "bg-white text-ink-600 border border-sand-200 hover:bg-sand-100"
                        }`}
                      >
                        $
                      </button>
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
                        className="flex-1 min-w-0 rounded-lg border border-sand-200 px-3 py-2 text-sm"
                        disabled={isDisabled}
                      />
                    </div>
                    <p className="text-xs text-ink-400">
                      {tipMode === "percent"
                        ? `Tip: ${tipValue || 0}% of subtotal (${formatCents(calculatedTipCents)})`
                        : `Tip: ${formatCents(calculatedTipCents)}`}
                    </p>
                  </div>
                )}
              </>
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
