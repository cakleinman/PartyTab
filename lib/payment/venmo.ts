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
 *
 * When options are provided, uses the `recipients` query param format to avoid
 * the double-recipient bug on mobile (where the Venmo app resolves both the
 * URL path and query params as separate recipients):
 *   https://venmo.com/?txn=pay&recipients=USERNAME&amount=XX.XX&note=TabName
 *
 * When no options, returns a simple profile URL:
 *   https://venmo.com/USERNAME
 */
export function buildVenmoWebLink(
  handle: string,
  options?: { amountCents?: number; note?: string },
): string {
  const username = handle.replace(/^@/, "");
  if (!options?.amountCents && !options?.note) {
    return `https://venmo.com/${encodeURIComponent(username)}`;
  }
  const params = new URLSearchParams({ txn: "pay", recipients: username });
  if (options.amountCents) {
    params.set("amount", (options.amountCents / 100).toFixed(2));
  }
  if (options.note) {
    params.set("note", options.note);
  }
  return `https://venmo.com/?${params.toString()}`;
}
