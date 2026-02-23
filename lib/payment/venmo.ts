/**
 * Build a Venmo web payment link with pre-filled amount.
 * https://venmo.com/USERNAME?txn=pay&amount=XX.XX&note=TabName
 *
 * On mobile, iOS/Android intercept venmo.com universal links and open
 * the Venmo app with the payment pre-filled. On desktop, it opens the
 * Venmo website (which doesn't support creating transactions).
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
  const params = new URLSearchParams({ txn: "pay", amount });
  if (note) {
    params.set("note", note);
  }
  return `https://venmo.com/${encodeURIComponent(username)}?${params.toString()}`;
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
