/**
 * Build a Venmo deep link for mobile payment.
 * venmo://paycharge?txn=pay&recipients=USERNAME&amount=XX.XX&note=TabName
 */
export function buildVenmoPayLink({
  handle,
  amountCents,
  note,
}: {
  handle: string;
  amountCents: number;
  note?: string;
}): string {
  // Strip leading @ if present
  const username = handle.replace(/^@/, "");
  const amount = (amountCents / 100).toFixed(2);
  const params = new URLSearchParams({
    txn: "pay",
    recipients: username,
    amount,
  });
  if (note) {
    params.set("note", note);
  }
  return `venmo://paycharge?${params.toString()}`;
}

/**
 * Build a Venmo web link with optional pre-filled payment details.
 * https://venmo.com/USERNAME?txn=pay&amount=XX.XX&note=TabName
 */
export function buildVenmoWebLink(
  handle: string,
  options?: { amountCents?: number; note?: string },
): string {
  const username = handle.replace(/^@/, "");
  const base = `https://venmo.com/${encodeURIComponent(username)}`;
  if (!options?.amountCents && !options?.note) return base;
  const params = new URLSearchParams({ txn: "pay" });
  if (options.amountCents) {
    params.set("amount", (options.amountCents / 100).toFixed(2));
  }
  if (options.note) {
    params.set("note", options.note);
  }
  return `${base}?${params.toString()}`;
}
