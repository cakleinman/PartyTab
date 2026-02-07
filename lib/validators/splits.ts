import { throwApiError } from "@/lib/api/errors";
import { parseUuid } from "@/lib/validators/schemas";
import { distributeEvenSplit } from "@/lib/money/cents";

export interface Split {
  participantId: string;
  amountCents: number;
}

export function parseSplits(
  body: Record<string, unknown>,
  amountTotalCents: number,
  participantIds: string[],
): Split[] {
  if (body?.evenSplit) {
    const targetIds = Array.isArray(body?.splitParticipantIds) && body.splitParticipantIds.length
      ? body.splitParticipantIds.map((id: string) => parseUuid(id, "participantId"))
      : participantIds;
    const uniqueIds = new Set<string>();
    targetIds.forEach((participantId: string) => {
      if (!participantIds.includes(participantId)) {
        throwApiError(400, "validation_error", "Split participant must be in tab");
      }
      if (uniqueIds.has(participantId)) {
        throwApiError(400, "validation_error", "Split participants must be unique");
      }
      uniqueIds.add(participantId);
    });
    if (uniqueIds.size === 0) {
      throwApiError(400, "validation_error", "Split participants are required");
    }
    return distributeEvenSplit(amountTotalCents, targetIds);
  }

  if (!Array.isArray(body?.splits) || body.splits.length === 0) {
    throwApiError(400, "validation_error", "Splits are required");
  }

  const seen = new Set<string>();
  const rawSplits = body.splits as Array<{ participantId?: string; amountCents?: number }>;
  const splits = rawSplits.map((split) => {
    if (!split?.participantId || typeof split?.amountCents !== "number") {
      throwApiError(400, "validation_error", "Invalid split format");
    }
    const participantId = parseUuid(split.participantId, "participantId");
    if (!participantIds.includes(participantId)) {
      throwApiError(400, "validation_error", "Split participant must be in tab");
    }
    if (!Number.isInteger(split.amountCents) || split.amountCents <= 0) {
      throwApiError(400, "validation_error", "Split amount must be greater than zero");
    }
    if (seen.has(participantId)) {
      throwApiError(400, "validation_error", "Split participants must be unique");
    }
    seen.add(participantId);
    return { participantId, amountCents: split.amountCents };
  });

  const sum = splits.reduce((total, split) => total + split.amountCents, 0);
  if (sum !== amountTotalCents) {
    throwApiError(400, "validation_error", "Split amounts must equal total");
  }
  return splits;
}
