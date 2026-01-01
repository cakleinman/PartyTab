import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant, requireTab } from "@/lib/api/guards";
import { computeNets } from "@/lib/settlement/computeSettlement";
import { parseDateInput, parseDescription, parseTabName, parseUuid } from "@/lib/validators/schemas";

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
    const tab = await requireTab(tabId);
    const participant = await requireParticipant(tabId, user.id);

    const [expenses, splits, participants, tabCreator] = await Promise.all([
      prisma.expense.findMany({ where: { tabId }, select: { amountTotalCents: true, paidByParticipantId: true, id: true } }),
      prisma.expenseSplit.findMany({ where: { expense: { tabId } }, select: { expenseId: true, participantId: true, amountCents: true } }),
      prisma.participant.findMany({ where: { tabId }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: tab.createdByUserId }, select: { subscriptionTier: true } }),
    ]);

    const totalSpentCents = expenses.reduce((sum, exp) => sum + exp.amountTotalCents, 0);
    const nets = computeNets(participants, expenses, splits);
    const userNet = nets.find((net) => net.participantId === participant.id)?.netCents ?? 0;

    // Pro features are available if the tab creator has a Pro subscription
    const hasProFeatures = tabCreator?.subscriptionTier === "PRO";

    return ok({
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
        yourNetCents: userNet,
        isCreator: tab.createdByUserId === user.id,
        hasProFeatures,
      },
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}

export async function PATCH(
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
    const tab = await requireTab(tabId);
    if (tab.createdByUserId !== user.id) {
      throwApiError(403, "forbidden", "Only the creator can edit the tab");
    }
    if (tab.status === "CLOSED") {
      throwApiError(409, "tab_closed", "Tab is closed");
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

    return ok({
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
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
