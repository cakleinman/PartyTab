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
 * Build a Venmo web profile link.
 * https://venmo.com/USERNAME
 *
 * NOTE: Do NOT add query params (txn, amount, etc.) to venmo.com URLs.
 * On mobile, the Venmo app intercepts these as universal links and
 * double-resolves the recipient (once from URL path, once from params).
 * Use buildVenmoPayLink() for pre-filled payments via the venmo:// deep link.
 */
export function buildVenmoWebLink(handle: string): string {
  const username = handle.replace(/^@/, "");
  return `https://venmo.com/${encodeURIComponent(username)}`;
}
