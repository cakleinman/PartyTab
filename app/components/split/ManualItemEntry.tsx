"use client";

import { useState } from "react";

interface ManualItemEntryProps {
  onAdd: (name: string, priceCents: number, quantity: number) => Promise<void> | void;
  disabled?: boolean;
}

/**
 * Inline form for adding receipt items by hand. Used when the user opts out
 * of AI receipt parsing or wants to add items on top of a parsed receipt.
 */
export function ManualItemEntry({ onAdd, disabled }: ManualItemEntryProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setPrice("");
    setQuantity("1");
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || submitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError("Item name is required");
      return;
    }
    const priceNum = parseFloat(price);
    if (!isFinite(priceNum) || priceNum <= 0) {
      setLocalError("Price must be greater than zero");
      return;
    }
    const priceCents = Math.round(priceNum * 100);
    const quantityNum = Math.max(1, Math.round(parseFloat(quantity) || 1));

    setSubmitting(true);
    setLocalError(null);
    try {
      await onAdd(trimmedName, priceCents, quantityNum);
      reset();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-dashed border-sand-300 bg-sand-50 p-3 space-y-2"
    >
      <p className="text-xs font-medium text-ink-600">Add item</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 100))}
          placeholder="Item name"
          aria-label="Item name"
          disabled={disabled || submitting}
          className="flex-1 min-w-0 rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
        />
        <input
          type="text"
          inputMode="decimal"
          value={price}
          onChange={(e) => {
            const v = e.target.value;
            if (/^[0-9]*\.?[0-9]{0,2}$/.test(v)) setPrice(v);
          }}
          placeholder="$0.00"
          aria-label="Item price"
          disabled={disabled || submitting}
          className="w-24 rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-ink-500">
          Qty
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            aria-label="Quantity"
            disabled={disabled || submitting}
            className="w-14 rounded-lg border border-sand-200 bg-white px-2 py-1 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={disabled || submitting || !name.trim() || !price}
          className="rounded-lg bg-ink-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add"}
        </button>
      </div>
      {localError && (
        <p role="alert" className="text-xs text-red-600">
          {localError}
        </p>
      )}
    </form>
  );
}

interface ItemEditRowProps {
  initialName: string;
  initialPriceCents: number;
  initialQuantity: number;
  onSave: (updates: { name?: string; priceCents?: number; quantity?: number }) => Promise<void> | void;
  onCancel: () => void;
  disabled?: boolean;
}

/**
 * Inline edit row swapped in when the user taps a pencil on an item.
 * Used by ClaimPanel via the onItemEdit hook.
 */
export function ItemEditRow({
  initialName,
  initialPriceCents,
  initialQuantity,
  onSave,
  onCancel,
  disabled,
}: ItemEditRowProps) {
  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState((initialPriceCents / 100).toFixed(2));
  const [quantity, setQuantity] = useState(String(initialQuantity));
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || saving) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError("Name required");
      return;
    }
    const priceNum = parseFloat(price);
    if (!isFinite(priceNum) || priceNum <= 0) {
      setLocalError("Invalid price");
      return;
    }
    const priceCents = Math.round(priceNum * 100);
    const quantityNum = Math.max(1, Math.round(parseFloat(quantity) || 1));

    const updates: { name?: string; priceCents?: number; quantity?: number } = {};
    if (trimmedName !== initialName) updates.name = trimmedName;
    if (priceCents !== initialPriceCents) updates.priceCents = priceCents;
    if (quantityNum !== initialQuantity) updates.quantity = quantityNum;

    if (Object.keys(updates).length === 0) {
      onCancel();
      return;
    }

    setSaving(true);
    setLocalError(null);
    try {
      await onSave(updates);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 100))}
          aria-label="Item name"
          disabled={disabled || saving}
          className="flex-1 min-w-0 rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
        />
        <input
          type="text"
          inputMode="decimal"
          value={price}
          onChange={(e) => {
            const v = e.target.value;
            if (/^[0-9]*\.?[0-9]{0,2}$/.test(v)) setPrice(v);
          }}
          aria-label="Item price"
          disabled={disabled || saving}
          className="w-24 rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-ink-500">
          Qty
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            aria-label="Quantity"
            disabled={disabled || saving}
            className="w-14 rounded-lg border border-sand-200 bg-white px-2 py-1 text-sm"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border border-sand-200 bg-white px-3 py-1.5 text-xs text-ink-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={disabled || saving || !name.trim() || !price}
            className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      {localError && (
        <p role="alert" className="text-xs text-red-600">
          {localError}
        </p>
      )}
    </form>
  );
}
