const AMOUNT_RE = /^\d+(?:\.\d{1,2})?$/;

export function parseCents(input: string, allowZero = false): number {
  const trimmed = input.trim();
  if (!AMOUNT_RE.test(trimmed)) {
    throw new Error("Invalid amount format");
  }
  const [whole, fraction = ""] = trimmed.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isFinite(cents)) {
    throw new Error("Invalid amount");
  }
  if (cents < 0 || (!allowZero && cents === 0)) {
    throw new Error("Amount must be greater than zero");
  }
  return cents;
}

export function formatCents(cents: number): string {
  const dollars = (cents / 100).toFixed(2);
  return `$${dollars}`;
}

export function formatCentsPlain(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function distributeEvenSplit(
  totalCents: number,
  participantIds: string[],
): { participantId: string; amountCents: number }[] {
  if (participantIds.length === 0) {
    throw new Error("No participants to split");
  }
  const sorted = [...participantIds].sort();
  const base = Math.floor(totalCents / sorted.length);
  const remainder = totalCents % sorted.length;
  const remainderStart = sorted.length - remainder;
  return sorted.map((participantId, index) => ({
    participantId,
    amountCents: base + (index >= remainderStart ? 1 : 0),
  }));
}
