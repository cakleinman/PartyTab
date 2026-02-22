"use client";

import { useState } from "react";
import { useToast } from "@/app/components/ToastProvider";

export type PaymentMethod = {
  id: string;
  type: "VENMO" | "ZELLE" | "PAYPAL" | "CASHAPP" | "CUSTOM";
  handle: string;
  label: string | null;
};

type Props = {
  paymentMethods: PaymentMethod[];
  onUpdate: () => void;
  disabled?: boolean;
};

type PaymentType = "VENMO" | "ZELLE" | "PAYPAL" | "CASHAPP" | "CUSTOM";

const PAYMENT_TYPES: { type: PaymentType; label: string; placeholder: string }[] = [
  { type: "VENMO", label: "Venmo", placeholder: "@username" },
  { type: "ZELLE", label: "Zelle", placeholder: "email or phone number" },
  { type: "PAYPAL", label: "PayPal", placeholder: "email address" },
  { type: "CASHAPP", label: "Cash App", placeholder: "$cashtag" },
  { type: "CUSTOM", label: "Custom", placeholder: "Payment instructions" },
];

function PaymentTypeRow({
  type,
  label,
  placeholder,
  savedHandle,
  disabled,
  onSave,
  onRemove,
}: {
  type: PaymentType;
  label: string;
  placeholder: string;
  savedHandle: string | null;
  disabled: boolean;
  onSave: (handle: string) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const [input, setInput] = useState(savedHandle ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!input.trim()) return;
    setSaving(true);
    await onSave(input.trim());
    setSaving(false);
  };

  const handleRemove = async () => {
    setSaving(true);
    await onRemove();
    setInput("");
    setSaving(false);
  };

  const hasChanged = input.trim() !== (savedHandle ?? "");

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3">
      <label htmlFor={`pm-${type}`} className="text-sm font-medium text-ink-900">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={`pm-${type}`}
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled || saving}
          className="flex-1 rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm placeholder-ink-400 focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-100 disabled:bg-sand-100 disabled:text-ink-500"
        />
        {!disabled && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleSave}
              disabled={!input.trim() || saving || !hasChanged}
              className="rounded-xl bg-ink-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-ink-800 disabled:opacity-40"
            >
              {saving ? "…" : "Save"}
            </button>
            {savedHandle && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={saving}
                className="rounded-xl border border-sand-300 bg-white px-3 py-2 text-xs font-semibold text-ink-600 transition hover:bg-sand-50 disabled:opacity-40"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
      {disabled && (
        <p className="text-xs text-ink-400">Create an account to save payment methods</p>
      )}
    </div>
  );
}

export function PaymentMethodForm({ paymentMethods, onUpdate, disabled = false }: Props) {
  const { pushToast } = useToast();

  const handleSave = async (type: PaymentType, handle: string) => {
    try {
      const res = await fetch("/api/me/payment-methods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, handle }),
      });
      if (!res.ok) {
        const data = await res.json();
        pushToast(data?.error?.message ?? "Failed to save");
        return;
      }
      pushToast(`${PAYMENT_TYPES.find((p) => p.type === type)?.label} saved`);
      onUpdate();
    } catch {
      pushToast("Network error");
    }
  };

  const handleRemove = async (type: PaymentType) => {
    try {
      const res = await fetch(`/api/me/payment-methods/${type}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        pushToast("Failed to remove");
        return;
      }
      pushToast(`${PAYMENT_TYPES.find((p) => p.type === type)?.label} removed`);
      onUpdate();
    } catch {
      pushToast("Network error");
    }
  };

  return (
    <div className="space-y-3">
      {PAYMENT_TYPES.map(({ type, label, placeholder }) => {
        const saved = paymentMethods.find((pm) => pm.type === type);
        return (
          <PaymentTypeRow
            key={type}
            type={type}
            label={label}
            placeholder={placeholder}
            savedHandle={saved?.handle ?? null}
            disabled={disabled}
            onSave={(handle) => handleSave(type, handle)}
            onRemove={() => handleRemove(type)}
          />
        );
      })}
    </div>
  );
}
