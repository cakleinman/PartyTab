import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireParticipant } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";
import { computeNets } from "@/lib/settlement/computeSettlement";

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
    await requireParticipant(tabId, user.id);

    const [participants, expenses, splits] = await Promise.all([
      prisma.participant.findMany({
        where: { tabId },
        include: { user: true },
      }),
      prisma.expense.findMany({
        where: { tabId },
        select: { id: true, paidByParticipantId: true, amountTotalCents: true },
      }),
      prisma.expenseSplit.findMany({
        where: { expense: { tabId } },
        select: { expenseId: true, participantId: true, amountCents: true },
      }),
    ]);

    const nets = computeNets(participants, expenses, splits);

    return ok({
      participants: participants.map((participant) => ({
        id: participant.id,
        userId: participant.userId,
        displayName: participant.user.displayName,
        netCents: nets.find((net) => net.participantId === participant.id)?.netCents ?? 0,
      })),
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
