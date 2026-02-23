/**
 * Build a Venmo web profile link.
 * https://venmo.com/USERNAME
 *
 * NOTE: Do NOT add query params (txn, amount, recipients, etc.) to venmo.com
 * URLs. On mobile, the Venmo app intercepts these as universal links and
 * double-resolves the recipient. All known formats (web URLs with query params,
 * venmo:// deep links) produce duplicate recipients as of Feb 2026.
 */
export function buildVenmoWebLink(handle: string): string {
  const username = handle.replace(/^@/, "");
  return `https://venmo.com/${encodeURIComponent(username)}`;
}
