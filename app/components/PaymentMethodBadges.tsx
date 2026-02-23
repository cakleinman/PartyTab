"use client";

import { buildVenmoWebLink } from "@/lib/payment/venmo";
import { formatCents } from "@/lib/money/cents";
import { useToast } from "@/app/components/ToastProvider";

export type PaymentMethodInfo = {
  type: "VENMO" | "ZELLE" | "PAYPAL" | "CASHAPP" | "CASH" | "CUSTOM";
  handle: string;
  label: string | null;
};

type Props = {
  paymentMethods: PaymentMethodInfo[];
  payeeName: string;
  amountCents: number;
  tabName?: string;
};

const TYPE_LABELS: Record<string, string> = {
  VENMO: "Venmo",
  ZELLE: "Zelle",
  PAYPAL: "PayPal",
  CASHAPP: "Cash App",
  CASH: "Cash",
  CUSTOM: "Payment info",
};

export function PaymentMethodBadges({
  paymentMethods,
  payeeName,
  amountCents,
  tabName,
}: Props) {
  const { pushToast } = useToast();

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      pushToast(`${label} copied to clipboard`);
    } catch {
      pushToast("Failed to copy");
    }
  };

  if (paymentMethods.length === 0) {
    return (
      <p className="text-xs text-ink-400">
        Ask {payeeName} to add payment details in Settings
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {paymentMethods.map((method) => {
        if (method.type === "CASH") {
          return (
            <div key={method.type} className="rounded-xl bg-sand-50 px-3 py-2 text-xs text-ink-600">
              <span className="font-semibold uppercase tracking-wide text-ink-400">Cash</span>
              {" — "}
              Accepts cash in person
            </div>
          );
        }

        if (method.type === "CUSTOM") {
          return (
            <div key={method.type} className="rounded-xl bg-sand-50 px-3 py-2 text-xs text-ink-600">
              <span className="font-semibold uppercase tracking-wide text-ink-400">
                {TYPE_LABELS[method.type]}
              </span>
              {" — "}
              {method.handle}
            </div>
          );
        }

        const isVenmo = method.type === "VENMO";

        return (
          <div
            key={method.type}
            className="flex items-center justify-between gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2"
          >
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                {TYPE_LABELS[method.type]}
              </span>
              <p className="truncate text-sm font-medium text-ink-900">{method.handle}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {isVenmo ? (
                <>
                  <button
                    type="button"
                    onClick={() => copyText(formatCents(amountCents), "Amount")}
                    className="shrink-0 rounded-full bg-sand-100 px-2.5 py-1 text-[11px] font-semibold text-ink-600 transition hover:bg-sand-200"
                  >
                    Copy
                  </button>
                  <a
                    href={buildVenmoWebLink(method.handle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-full bg-sand-100 px-2.5 py-1 text-[11px] font-semibold text-ink-600 transition hover:bg-sand-200"
                  >
                    Open
                  </a>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => copyText(method.handle, "Handle")}
                  className="shrink-0 rounded-full bg-sand-100 px-2.5 py-1 text-[11px] font-semibold text-ink-600 transition hover:bg-sand-200"
                >
                  Copy
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
