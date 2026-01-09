"use client";

import { useState, useRef, useCallback } from "react";

export interface ReceiptItem {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  claimedBy: { participantId: string; displayName: string }[];
}

export interface ParsedTotals {
  subtotalCents?: number;
  taxCents?: number;
  totalCents?: number;
}

interface ReceiptUploadProps {
  tabId: string;
  expenseId: string;
  initialReceipt?: { path: string; url: string } | null;
  onUploadComplete?: (receipt: { path: string; url: string }) => void;
  onDelete?: () => void;
  onParseComplete?: (items: ReceiptItem[], parsed?: ParsedTotals) => void;
  disabled?: boolean;
}

export function ReceiptUpload({
  tabId,
  expenseId,
  initialReceipt,
  onUploadComplete,
  onDelete,
  onParseComplete,
  disabled,
}: ReceiptUploadProps) {
  const [receipt, setReceipt] = useState(initialReceipt);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = async () => {
    setError(null);
    setParsing(true);

    try {
      const res = await fetch(
        `/api/tabs/${tabId}/expenses/${expenseId}/receipt/parse`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error?.message ?? "Parse failed");
        return;
      }

      onParseComplete?.(data.items, data.parsed);
    } catch {
      setError("Parse failed");
    } finally {
      setParsing(false);
    }
  };

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(
          `/api/tabs/${tabId}/expenses/${expenseId}/receipt`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data?.error?.message ?? "Upload failed");
          return;
        }

        setReceipt(data.receipt);
        onUploadComplete?.(data.receipt);
      } catch {
        setError("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [tabId, expenseId, onUploadComplete]
  );

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);

    try {
      const res = await fetch(
        `/api/tabs/${tabId}/expenses/${expenseId}/receipt`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error?.message ?? "Delete failed");
        return;
      }

      setReceipt(null);
      onDelete?.();
    } catch {
      setError("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  if (receipt) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-xl border border-sand-200 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={receipt.url}
            alt="Receipt"
            className="w-full max-h-64 object-contain bg-sand-50"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || parsing}
              className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 shadow hover:bg-white transition"
            >
              {deleting ? (
                <svg
                  className="h-4 w-4 animate-spin text-ink-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
        {!disabled && onParseComplete && (
          <button
            type="button"
            onClick={handleParse}
            disabled={parsing}
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-sand-50 disabled:opacity-50"
          >
            {parsing ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Parsing receipt...
              </span>
            ) : (
              "Parse receipt items"
            )}
          </button>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition cursor-pointer ${
          disabled
            ? "border-sand-200 bg-sand-50 cursor-not-allowed opacity-50"
            : dragOver
              ? "border-ink-400 bg-ink-50"
              : "border-sand-300 hover:border-sand-400 hover:bg-sand-50"
        }`}
      >
        {uploading ? (
          <>
            <svg
              className="h-8 w-8 animate-spin text-ink-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="mt-2 text-sm text-ink-500">Uploading...</p>
          </>
        ) : (
          <>
            <svg
              className="h-8 w-8 text-ink-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-ink-600">
              {dragOver ? "Drop to upload" : "Tap to upload receipt"}
            </p>
            <p className="text-xs text-ink-400">JPEG, PNG, WebP, HEIC up to 10MB</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
