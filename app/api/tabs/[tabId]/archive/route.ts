import { prisma } from "@/lib/db/prisma";
import { ok, noContent, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireTab, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";

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

    const tab = await requireTab(tabId);
    if (tab.createdByUserId !== user.id) {
      throwApiError(403, "forbidden", "Only the creator can archive the tab");
    }
    if (tab.status !== "CLOSED") {
      throwApiError(409, "validation_error", "Only closed tabs can be archived");
    }
    if (tab.archivedAt) {
      throwApiError(409, "validation_error", "Tab is already archived");
    }

    // Check settlement is 100% acknowledged
    const [settlement, acknowledgements] = await Promise.all([
      prisma.settlement.findUnique({
        where: { tabId },
        include: { transfers: { select: { id: true } } },
      }),
      prisma.settlementAcknowledgement.findMany({
        where: { tabId, status: "ACKNOWLEDGED" },
        select: { id: true },
      }),
    ]);

    if (settlement) {
      const totalTransfers = settlement.transfers.length;
      const acknowledgedCount = acknowledgements.length;

      if (totalTransfers > 0 && acknowledgedCount < totalTransfers) {
        throwApiError(
          409,
          "validation_error",
          "All settlement transfers must be acknowledged before archiving"
        );
      }
    }

    const updated = await prisma.tab.update({
      where: { id: tabId },
      data: { archivedAt: new Date() },
    });

    const response = ok({ archivedAt: updated.archivedAt?.toISOString() });
    logApiResponse(request, user.id, response.status, startTime);
    return response;
  } catch (error) {
    if (isApiError(error)) {
      const response = apiError(error.status, error.code, error.message);
      logApiResponse(request, null, response.status, startTime);
      return response;
    }
    const response = validationError(error);
    logApiResponse(request, null, response.status, startTime);
    return response;
  }
}

export async function DELETE(
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

    const tab = await requireTab(tabId);
    if (tab.createdByUserId !== user.id) {
      throwApiError(403, "forbidden", "Only the creator can unarchive the tab");
    }
    if (!tab.archivedAt) {
      throwApiError(409, "validation_error", "Tab is not archived");
    }

    await prisma.tab.update({
      where: { id: tabId },
      data: { archivedAt: null },
    });

    const response = noContent();
    logApiResponse(request, user.id, response.status, startTime);
    return response;
  } catch (error) {
    if (isApiError(error)) {
      const response = apiError(error.status, error.code, error.message);
      logApiResponse(request, null, response.status, startTime);
      return response;
    }
    const response = validationError(error);
    logApiResponse(request, null, response.status, startTime);
    return response;
  }
}
