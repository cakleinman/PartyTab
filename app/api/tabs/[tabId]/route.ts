import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireTab, requireOpenTab, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";
import { computeNets } from "@/lib/settlement/computeSettlement";
import { parseDateInput, parseDescription, parseTabName, parseUuid } from "@/lib/validators/schemas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user?.id);
    if (rateLimitResponse) return rateLimitResponse;

    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const tab = await requireTab(tabId);
    const participant = await requireParticipant(tabId, user.id);

    const [expenses, splits, participants, tabCreator] = await Promise.all([
      prisma.expense.findMany({ where: { tabId }, select: { amountTotalCents: true, paidByParticipantId: true, id: true, isEstimate: true } }),
      prisma.expenseSplit.findMany({ where: { expense: { tabId } }, select: { expenseId: true, participantId: true, amountCents: true } }),
      prisma.participant.findMany({ where: { tabId }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: tab.createdByUserId }, select: { subscriptionTier: true } }),
    ]);

    const totalSpentCents = expenses.reduce((sum, exp) => sum + exp.amountTotalCents, 0);
    const estimatedExpenses = expenses.filter((exp) => exp.isEstimate);
    const confirmedExpenses = expenses.filter((exp) => !exp.isEstimate);
    const estimatedTotalCents = estimatedExpenses.reduce((sum, exp) => sum + exp.amountTotalCents, 0);
    const confirmedTotalCents = confirmedExpenses.reduce((sum, exp) => sum + exp.amountTotalCents, 0);
    const estimateCount = estimatedExpenses.length;
    const nets = computeNets(participants, expenses, splits);
    const userNet = nets.find((net) => net.participantId === participant.id)?.netCents ?? 0;

    // Pro features are available if the tab creator has a Pro subscription
    const hasProFeatures = tabCreator?.subscriptionTier === "PRO";

    const result = ok({
      tab: {
        id: tab.id,
        name: tab.name,
        description: tab.description,
        status: tab.status,
        startDate: tab.startDate.toISOString().slice(0, 10),
        endDate: tab.endDate ? tab.endDate.toISOString().slice(0, 10) : null,
        createdAt: tab.createdAt.toISOString(),
        closedAt: tab.closedAt ? tab.closedAt.toISOString() : null,
        totalSpentCents,
        estimatedTotalCents,
        confirmedTotalCents,
        estimateCount,
        yourNetCents: userNet,
        isCreator: tab.createdByUserId === user.id,
        hasProFeatures,
      },
    });
    logApiResponse(request, user?.id ?? null, result.status, startTime);
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tabId: string }> },
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user?.id);
    if (rateLimitResponse) return rateLimitResponse;

    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const tab = await requireOpenTab(tabId);
    if (tab.createdByUserId !== user.id) {
      throwApiError(403, "forbidden", "Only the creator can edit the tab");
    }

    const body = await request.json();
    const data: { name?: string; description?: string | null; endDate?: Date | null } = {};
    if (body?.name !== undefined) {
      data.name = parseTabName(body.name);
    }
    if (body?.description !== undefined) {
      data.description = parseDescription(body.description);
    }
    if (body?.endDate !== undefined) {
      data.endDate = parseDateInput(body.endDate);
    }

    const updated = await prisma.tab.update({
      where: { id: tabId },
      data,
    });

    const result = ok({
      tab: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        status: updated.status,
        startDate: updated.startDate.toISOString().slice(0, 10),
        endDate: updated.endDate ? updated.endDate.toISOString().slice(0, 10) : null,
        createdAt: updated.createdAt.toISOString(),
        closedAt: updated.closedAt ? updated.closedAt.toISOString() : null,
        isCreator: updated.createdByUserId === user.id,
      },
    });
    logApiResponse(request, user?.id ?? null, result.status, startTime);
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
