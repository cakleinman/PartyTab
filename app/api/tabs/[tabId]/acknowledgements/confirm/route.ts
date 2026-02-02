import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";
import { confirmAcknowledgement } from "@/lib/settlement/acknowledgement";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    await requireParticipant(tabId, user.id);
    const body = await request.json();
    const fromParticipantId = parseUuid(body?.fromParticipantId, "fromParticipantId");
    const toParticipantId = parseUuid(body?.toParticipantId, "toParticipantId");
    const updated = await confirmAcknowledgement(prisma, {
      tabId,
      userId: user.id,
      fromParticipantId,
      toParticipantId,
    });

    return ok({
      acknowledgement: {
        fromParticipantId: updated.fromParticipantId,
        toParticipantId: updated.toParticipantId,
        amountCents: updated.amountCents,
        status: updated.status,
        initiatedAt: updated.initiatedAt.toISOString(),
        acknowledgedAt: updated.acknowledgedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
