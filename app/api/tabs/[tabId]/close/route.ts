import { prisma } from "@/lib/db/prisma";
import { created, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireTab, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";
import { computeNets, computeSettlement } from "@/lib/settlement/computeSettlement";

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
      throwApiError(403, "forbidden", "Only the creator can close the tab");
    }
    if (tab.status === "CLOSED") {
      throwApiError(409, "tab_closed", "Tab is already closed");
    }

    const body = await request.json().catch(() => ({}));
    const convertEstimates = body?.convertEstimates === true;

    const result = await prisma.$transaction(async (tx) => {
      // If user requested, convert all estimates to confirmed
      if (convertEstimates) {
        await tx.expense.updateMany({
          where: { tabId, isEstimate: true },
          data: { isEstimate: false },
        });
      }

      const [participants, expenses, splits] = await Promise.all([
        tx.participant.findMany({ where: { tabId }, select: { id: true } }),
        tx.expense.findMany({ where: { tabId }, select: { id: true, paidByParticipantId: true, amountTotalCents: true } }),
        tx.expenseSplit.findMany({ where: { expense: { tabId } }, select: { expenseId: true, participantId: true, amountCents: true } }),
      ]);

      const nets = computeNets(participants, expenses, splits);
      const transfers = computeSettlement(nets.map((net) => ({ ...net })));

      const settlement = await tx.settlement.create({
        data: {
          tabId,
          transfers: {
            create: transfers.map((transfer) => ({
              fromParticipantId: transfer.fromParticipantId,
              toParticipantId: transfer.toParticipantId,
              amountCents: transfer.amountCents,
            })),
          },
        },
      });

      const closedTab = await tx.tab.update({
        where: { id: tabId },
        data: { status: "CLOSED", closedAt: new Date() },
      });

      return { settlement, closedTab, transfers };
    });

    const response = created({
      settlement: {
        createdAt: result.settlement.createdAt.toISOString(),
        transfers: result.transfers,
      },
      estimatesConverted: convertEstimates,
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
