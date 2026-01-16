"use client";

import { useRef, useState, useMemo } from "react";
import { formatCents } from "@/lib/money/cents";

export interface ReceiptItem {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  claimedBy: { participantId: string; displayName: string }[];
}

interface Participant {
  id: string;
  displayName: string;
}

interface ClaimPanelProps {
  items: ReceiptItem[];
  participants: Participant[];
  currentParticipantId: string;
  onClaimToggle: (itemId: string, participantId: string) => void;
  onReceiptUpload?: (file: File) => void;
  onReceiptParse?: () => void;
  uploadedReceipt?: { url: string } | null;
  isUploading?: boolean;
  isParsing?: boolean;
  disabled?: boolean;
  // For tax/tip/fee distribution
  subtotalCents?: number;
  taxCents?: number;
  feeCents?: number;
  tipCents?: number;
}

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

export function ClaimPanel({
  items,
  participants,
  onClaimToggle,
  onReceiptUpload,
  onReceiptParse,
  uploadedReceipt,
  isUploading,
  isParsing,
  disabled,
  subtotalCents,
  taxCents,
  feeCents,
  tipCents,
}: ClaimPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Memoize unique initials
  const uniqueInitials = useMemo(() => getUniqueInitials(participants), [participants]);

  // Calculate each participant's total based on claims (including proportional tax/fees/tip)
  const calculateTotals = (): { totals: Record<string, number>; itemSubtotal: number } => {
    const totals: Record<string, number> = {};
    let itemSubtotal = 0;

    // First pass: calculate item totals
    items.forEach((item) => {
      if (item.claimedBy.length > 0) {
        const splitAmount = Math.floor(item.priceCents / item.claimedBy.length);
        item.claimedBy.forEach((claim) => {
          totals[claim.participantId] =
            (totals[claim.participantId] || 0) + splitAmount;
          itemSubtotal += splitAmount;
        });
      }
    });

    // Add proportional tax
    const tax = taxCents || 0;
    const baseSubtotal = subtotalCents || itemSubtotal;
    if (tax > 0 && itemSubtotal > 0) {
      Object.keys(totals).forEach((participantId) => {
        const share = totals[participantId] / baseSubtotal;
        totals[participantId] += Math.round(share * tax);
      });
    }

    // Add proportional fees
    const fees = feeCents || 0;
    if (fees > 0 && itemSubtotal > 0) {
      Object.keys(totals).forEach((participantId) => {
        const share = totals[participantId] / (itemSubtotal + tax);
        totals[participantId] += Math.round(share * fees);
      });
    }

    // Add proportional tip
    const tip = tipCents || 0;
    if (tip > 0 && itemSubtotal > 0) {
      Object.keys(totals).forEach((participantId) => {
        const share = totals[participantId] / (itemSubtotal + tax + fees);
        totals[participantId] += Math.round(share * tip);
      });
    }

    return { totals, itemSubtotal };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onReceiptUpload) {
      onReceiptUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/") && onReceiptUpload) {
      onReceiptUpload(file);
    }
  };

  const { totals, itemSubtotal: _itemSubtotal } = calculateTotals();
  const unclaimedItems = items.filter((item) => item.claimedBy.length === 0);

  // Show upload UI when no items and upload handler is provided
  if (items.length === 0 && onReceiptUpload) {
    return (
      <div className="space-y-3">
        {uploadedReceipt ? (
          <>
            {/* Show uploaded receipt preview */}
            <div className="relative rounded-xl border border-sand-200 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedReceipt.url}
                alt="Receipt"
                className="w-full max-h-48 object-contain bg-sand-50"
              />
            </div>
            {onReceiptParse ? (
              <button
                type="button"
                onClick={onReceiptParse}
                disabled={isParsing || disabled}
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-sand-50 disabled:opacity-50"
              >
                {isParsing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Parsing receipt...
                  </span>
                ) : (
                  "Parse receipt items"
                )}
              </button>
            ) : isParsing ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-amber-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm font-medium text-amber-800">Parsing receipt...</p>
                </div>
                <p className="text-xs text-amber-600 mt-1">Add tip below while you wait</p>
              </div>
            ) : (
              <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-center">
                <p className="text-sm font-medium text-green-800">Receipt uploaded!</p>
                <p className="text-xs text-green-600 mt-1">Parsing will begin automatically</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Upload UI */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition cursor-pointer ${
                disabled || isUploading
                  ? "border-sand-200 bg-sand-50 cursor-not-allowed opacity-50"
                  : dragOver
                    ? "border-ink-400 bg-ink-50"
                    : "border-sand-300 hover:border-sand-400 hover:bg-sand-50"
              }`}
            >
              {isUploading ? (
                <>
                  <svg className="h-8 w-8 animate-spin text-ink-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="mt-2 text-sm text-ink-500">Uploading...</p>
                </>
              ) : (
                <>
                  <svg className="h-8 w-8 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-ink-600">
                    {dragOver ? "Drop to upload" : "Take photo or upload receipt"}
                  </p>
                  <p className="text-xs text-ink-400">AI will extract items for claiming</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                capture="environment"
                onChange={handleFileSelect}
                disabled={disabled || isUploading}
                className="hidden"
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // Show message when no upload handler (expense doesn't exist yet)
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-ink-500">
        <p>No receipt items to claim.</p>
        <p className="text-xs mt-1">Upload a receipt to extract items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with tax/fees badges */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold">Receipt Items</p>
          <p className="text-xs text-ink-500">
            Tap initials to claim. Shared items split evenly.
          </p>
        </div>
        <div className="flex gap-1">
          {taxCents && taxCents > 0 && (
            <p className="text-xs text-ink-500 bg-sand-100 px-2 py-1 rounded-lg">
              +{formatCents(taxCents)} tax
            </p>
          )}
          {feeCents && feeCents > 0 && (
            <p className="text-xs text-ink-500 bg-sand-100 px-2 py-1 rounded-lg">
              +{formatCents(feeCents)} fees
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
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
                    onClick={() => onClaimToggle(item.id, participant.id)}
                    disabled={disabled}
                    title={participant.displayName}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition flex items-center justify-center ${
                      isClaimed
                        ? "bg-ink-900 text-white"
                        : "bg-sand-100 text-ink-400 hover:bg-sand-200"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {uniqueInitials[participant.id] || "?"}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Unclaimed warning */}
      {unclaimedItems.length > 0 && (
        <p className="text-xs text-amber-600">
          {unclaimedItems.length} item{unclaimedItems.length > 1 ? "s" : ""}{" "}
          unclaimed
        </p>
      )}

      {/* Split summary */}
      {Object.keys(totals).length > 0 && (
        <div className="rounded-xl bg-sand-100 p-3 space-y-1">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-ink-700">Split Summary</p>
            {(() => {
              const extras: string[] = [];
              if (taxCents && taxCents > 0) extras.push(`${formatCents(taxCents)} tax`);
              if (feeCents && feeCents > 0) extras.push(`${formatCents(feeCents)} fees`);
              if (tipCents && tipCents > 0) extras.push(`${formatCents(tipCents)} tip`);
              return extras.length > 0 ? (
                <p className="text-xs text-ink-500">incl. {extras.join(", ")}</p>
              ) : null;
            })()}
          </div>
          {participants
            .filter((p) => totals[p.id])
            .map((participant) => (
              <div
                key={participant.id}
                className="flex justify-between text-xs text-ink-600"
              >
                <span>{participant.displayName}</span>
                <span>{formatCents(totals[participant.id])}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
