"use client";

import { useRef, useState } from "react";
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
  // For tax distribution
  subtotalCents?: number;
  taxCents?: number;
}

export function ClaimPanel({
  items,
  participants,
  currentParticipantId,
  onClaimToggle,
  onReceiptUpload,
  onReceiptParse,
  uploadedReceipt,
  isUploading,
  isParsing,
  disabled,
  subtotalCents,
  taxCents,
}: ClaimPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Calculate each participant's total based on claims (including proportional tax)
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

    // Second pass: add proportional tax
    if (taxCents && itemSubtotal > 0) {
      const baseSubtotal = subtotalCents || itemSubtotal;
      Object.keys(totals).forEach((participantId) => {
        const participantShare = totals[participantId] / baseSubtotal;
        const participantTax = Math.round(participantShare * taxCents);
        totals[participantId] += participantTax;
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

  const { totals, itemSubtotal } = calculateTotals();
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
            ) : (
              <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-center">
                <p className="text-sm font-medium text-green-800">Receipt ready!</p>
                <p className="text-xs text-green-600 mt-1">Click "Save expense" below to extract items with AI</p>
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
    <div className="space-y-4">
      <p className="text-sm text-ink-500">
        Tap items you consumed. Shared items split among claimers.
      </p>

      <div className="space-y-2">
        {items.map((item) => {
          const isClaimed = item.claimedBy.some(
            (c) => c.participantId === currentParticipantId
          );
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-xl border p-3 ${
                isClaimed
                  ? "border-ink-300 bg-ink-50"
                  : "border-sand-200 bg-white"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <span>{formatCents(item.priceCents)}</span>
                  {item.quantity > 1 && <span>× {item.quantity}</span>}
                </div>
                {item.claimedBy.length > 0 && (
                  <p className="text-xs text-ink-400 mt-1 truncate">
                    {item.claimedBy.map((c) => c.displayName).join(", ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onClaimToggle(item.id, currentParticipantId)}
                disabled={disabled}
                className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                  isClaimed
                    ? "bg-ink-900 text-white"
                    : "border border-ink-200 text-ink-500 hover:bg-sand-100"
                }`}
              >
                {isClaimed ? "Claimed" : "Claim"}
              </button>
            </div>
          );
        })}
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
            {taxCents && taxCents > 0 && (
              <p className="text-xs text-ink-500">incl. {formatCents(taxCents)} tax</p>
            )}
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
