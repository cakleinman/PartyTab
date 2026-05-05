import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireTab, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";
import { computeNets, computeSettlement } from "@/lib/settlement/computeSettlement";

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

    const tab = await requireTab(tabId);
    await requireParticipant(tabId, user.id);

    // For closed tabs, return the saved settlement
    if (tab.status === "CLOSED") {
      const settlement = await prisma.settlement.findUnique({
        where: { tabId },
        include: { transfers: true },
      });

      if (!settlement) {
        throwApiError(404, "not_found", "Settlement not found");
      }

      const response = ok({
        settlement: {
          createdAt: settlement.createdAt.toISOString(),
          transfers: settlement.transfers.map((transfer) => ({
            fromParticipantId: transfer.fromParticipantId,
            toParticipantId: transfer.toParticipantId,
            amountCents: transfer.amountCents,
          })),
        },
        isPreview: false,
      });
      logApiResponse(request, user.id, response.status, startTime);
      return response;
    }

    // For active tabs, compute settlement on-the-fly (preview mode)
    const [participants, expenses, splits] = await Promise.all([
      prisma.participant.findMany({ where: { tabId }, select: { id: true } }),
      prisma.expense.findMany({ where: { tabId }, select: { id: true, paidByParticipantId: true, amountTotalCents: true } }),
      prisma.expenseSplit.findMany({ where: { expense: { tabId } }, select: { expenseId: true, participantId: true, amountCents: true } }),
    ]);

    const nets = computeNets(participants, expenses, splits);
    const transfers = computeSettlement(nets.map((net) => ({ ...net })));

    const response = ok({
      settlement: {
        createdAt: new Date().toISOString(),
        transfers: transfers.map((transfer) => ({
          fromParticipantId: transfer.fromParticipantId,
          toParticipantId: transfer.toParticipantId,
          amountCents: transfer.amountCents,
        })),
      },
      isPreview: true,
    });
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
