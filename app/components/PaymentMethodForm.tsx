"use client";

import { useState } from "react";
import { useToast } from "@/app/components/ToastProvider";

export type PaymentMethod = {
  id: string;
  type: "VENMO" | "ZELLE" | "PAYPAL" | "CASHAPP" | "CASH" | "CUSTOM";
  handle: string;
  label: string | null;
};

type Props = {
  paymentMethods: PaymentMethod[];
  onUpdate: () => void;
  disabled?: boolean;
};

type PaymentType = "VENMO" | "ZELLE" | "PAYPAL" | "CASHAPP" | "CASH" | "CUSTOM";

const PAYMENT_TYPES: {
  type: PaymentType;
  label: string;
  placeholder: string;
  prefix?: string;
  toggle?: boolean;
}[] = [
  { type: "VENMO", label: "Venmo", placeholder: "username", prefix: "@" },
  { type: "ZELLE", label: "Zelle", placeholder: "email or phone number" },
  { type: "PAYPAL", label: "PayPal", placeholder: "email address" },
  { type: "CASHAPP", label: "Cash App", placeholder: "cashtag", prefix: "$" },
  { type: "CASH", label: "Cash", placeholder: "", toggle: true },
  { type: "CUSTOM", label: "Custom", placeholder: "Payment instructions" },
];

function PaymentTypeRow({
  type,
  label,
  placeholder,
  prefix,
  savedHandle,
  disabled,
  onSave,
  onRemove,
}: {
  type: PaymentType;
  label: string;
  placeholder: string;
  prefix?: string;
  savedHandle: string | null;
  disabled: boolean;
  onSave: (handle: string) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  // Strip prefix from saved value for display in input
  const stripPrefix = (val: string) =>
    prefix && val.startsWith(prefix) ? val.slice(prefix.length) : val;
  const [input, setInput] = useState(stripPrefix(savedHandle ?? ""));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!input.trim()) return;
    setSaving(true);
    // Always store with prefix
    const value = prefix ? `${prefix}${input.trim().replace(new RegExp(`^\\${prefix}`), "")}` : input.trim();
    await onSave(value);
    setSaving(false);
  };

  const handleRemove = async () => {
    setSaving(true);
    await onRemove();
    setInput("");
    setSaving(false);
  };

  const fullValue = prefix ? `${prefix}${input.trim().replace(new RegExp(`^\\${prefix}`), "")}` : input.trim();
  const hasChanged = fullValue !== (savedHandle ?? "");

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3">
      <label htmlFor={`pm-${type}`} className="text-sm font-medium text-ink-900">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex flex-1">
          {prefix && (
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-sand-200 bg-sand-100 px-3 text-sm text-ink-500">
              {prefix}
            </span>
          )}
          <input
            id={`pm-${type}`}
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => {
              // Strip prefix if user types it
              const val = prefix && e.target.value.startsWith(prefix)
                ? e.target.value.slice(prefix.length)
                : e.target.value;
              setInput(val);
            }}
            disabled={disabled || saving}
            className={`flex-1 border border-sand-200 bg-white px-3 py-2.5 text-sm placeholder-ink-400 focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-100 disabled:bg-sand-100 disabled:text-ink-500 ${prefix ? "rounded-r-xl" : "rounded-xl"}`}
          />
        </div>
        {!disabled && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleSave}
              disabled={!input.trim() || saving || !hasChanged}
              className="flex-1 sm:flex-initial rounded-xl bg-ink-900 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-ink-800 disabled:opacity-40"
            >
              {saving ? "…" : "Save"}
            </button>
            {savedHandle && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={saving}
                className="flex-1 sm:flex-initial rounded-xl border border-sand-300 bg-white px-3 py-2.5 text-xs font-semibold text-ink-600 transition hover:bg-sand-50 disabled:opacity-40"
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

function PaymentToggleRow({
  label,
  enabled,
  disabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  disabled: boolean;
  onToggle: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    setSaving(true);
    await onToggle();
    setSaving(false);
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3">
      <span className="text-sm font-medium text-ink-900">{label}</span>
      {!disabled ? (
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={`Toggle ${label}`}
          onClick={handleToggle}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            enabled ? "bg-green-600" : "bg-sand-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      ) : (
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
        pushToast(data?.error?.message ?? "Could not save — please try again");
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
        pushToast("Could not remove — please try again");
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
      {PAYMENT_TYPES.map(({ type, label, placeholder, prefix, toggle }) => {
        const saved = paymentMethods.find((pm) => pm.type === type);
        if (toggle) {
          return (
            <PaymentToggleRow
              key={type}
              label={label}
              enabled={!!saved}
              disabled={disabled}
              onToggle={async () => {
                if (saved) {
                  await handleRemove(type);
                } else {
                  await handleSave(type, "accepted");
                }
              }}
            />
          );
        }
        return (
          <PaymentTypeRow
            key={type}
            type={type}
            label={label}
            placeholder={placeholder}
            prefix={prefix}
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
