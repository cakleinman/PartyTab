"use client";

import { buildVenmoPayLink, buildVenmoWebLink } from "@/lib/payment/venmo";
import { useToast } from "@/app/components/ToastProvider";

export type PaymentMethodInfo = {
  type: "VENMO" | "ZELLE" | "PAYPAL" | "CASHAPP" | "CUSTOM";
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
  CUSTOM: "Payment info",
};

export function PaymentMethodBadges({
  paymentMethods,
  payeeName,
  amountCents,
  tabName,
}: Props) {
  const { pushToast } = useToast();

  const copyHandle = async (handle: string) => {
    try {
      await navigator.clipboard.writeText(handle);
      pushToast("Copied to clipboard");
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
        if (method.type === "VENMO") {
          const deepLink = buildVenmoPayLink({
            handle: method.handle,
            amountCents,
            note: tabName,
          });
          const webLink = buildVenmoWebLink(method.handle);

          return (
            <div key={method.type} className="flex flex-wrap items-center gap-2">
              <a
                href={deepLink}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#008CFF] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0074D4]"
              >
                Pay with Venmo
              </a>
              <a
                href={webLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-ink-400 hover:text-ink-600"
              >
                Open on web
              </a>
            </div>
          );
        }

        if (method.type === "CUSTOM") {
          return (
            <div key={method.type} className="rounded-xl bg-sand-50 px-3 py-2 text-xs text-ink-600">
              {method.handle}
            </div>
          );
        }

        // Zelle, PayPal, CashApp — show handle + copy button
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
            <button
              type="button"
              onClick={() => copyHandle(method.handle)}
              className="shrink-0 rounded-full bg-sand-100 px-2.5 py-1 text-[11px] font-semibold text-ink-600 transition hover:bg-sand-200"
            >
              Copy
            </button>
          </div>
        );
      })}
    </div>
  );
}
