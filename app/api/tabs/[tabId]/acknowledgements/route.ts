import { prisma } from "@/lib/db/prisma";
import { created, error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";
import { initiateAcknowledgement, listAcknowledgements } from "@/lib/settlement/acknowledgement";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;
    await requireParticipant(tabId, user.id);
    const acknowledgements = await listAcknowledgements(prisma, tabId, user.id);
    const result = ok({ acknowledgements });
    logApiResponse(request, user.id, result.status, startTime);
    return result;
  } catch (error) {
    if (isApiError(error)) {
      const result = apiError(error.status, error.code, error.message);
      logApiResponse(request, null, result.status, startTime);
      return result;
    }
    const result = validationError(error);
    logApiResponse(request, null, result.status, startTime);
    return result;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;
    await requireParticipant(tabId, user.id);
    const body = await request.json();
    const fromParticipantId = parseUuid(body?.fromParticipantId, "fromParticipantId");
    const toParticipantId = parseUuid(body?.toParticipantId, "toParticipantId");
    const acknowledgement = await initiateAcknowledgement(prisma, {
      tabId,
      userId: user.id,
      fromParticipantId,
      toParticipantId,
    });

    const result = created({
      acknowledgement: {
        fromParticipantId: acknowledgement.fromParticipantId,
        toParticipantId: acknowledgement.toParticipantId,
        amountCents: acknowledgement.amountCents,
        status: acknowledgement.status,
        initiatedAt: acknowledgement.initiatedAt.toISOString(),
        acknowledgedAt: acknowledgement.acknowledgedAt?.toISOString() ?? null,
      },
    });
    logApiResponse(request, user.id, result.status, startTime);
    return result;
  } catch (error) {
    if (isApiError(error)) {
      const result = apiError(error.status, error.code, error.message);
      logApiResponse(request, null, result.status, startTime);
      return result;
    }
    const result = validationError(error);
    logApiResponse(request, null, result.status, startTime);
    return result;
  }
}
