import { prisma } from "@/lib/db/prisma";
import { created, error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";
import { initiateAcknowledgement, listAcknowledgements } from "@/lib/settlement/acknowledgement";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const acknowledgements = await listAcknowledgements(prisma, tabId, user.id);
    return ok({ acknowledgements });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}

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
    const body = await request.json();
    const fromParticipantId = parseUuid(body?.fromParticipantId, "fromParticipantId");
    const toParticipantId = parseUuid(body?.toParticipantId, "toParticipantId");
    const acknowledgement = await initiateAcknowledgement(prisma, {
      tabId,
      userId: user.id,
      fromParticipantId,
      toParticipantId,
    });

    return created({
      acknowledgement: {
        fromParticipantId: acknowledgement.fromParticipantId,
        toParticipantId: acknowledgement.toParticipantId,
        amountCents: acknowledgement.amountCents,
        status: acknowledgement.status,
        initiatedAt: acknowledgement.initiatedAt.toISOString(),
        acknowledgedAt: acknowledgement.acknowledgedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
