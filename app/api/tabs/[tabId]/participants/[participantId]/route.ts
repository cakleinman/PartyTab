import { prisma } from "@/lib/db/prisma";
import { error as apiError, ok, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession, requireTab, requireOpenTab, checkApiRateLimit, logApiResponse } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tabId: string; participantId: string }> },
) {
  const startTime = Date.now();
  try {
    const { tabId: rawTabId, participantId: rawParticipantId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const participantId = parseUuid(rawParticipantId, "participantId");

    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }
    const { response: rateLimitResponse } = await checkApiRateLimit(request, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const tab = await requireOpenTab(tabId);
    if (tab.createdByUserId !== user.id) {
      throwApiError(403, "forbidden", "Only the tab owner can remove participants");
    }

    // Find the participant to remove
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: { user: true },
    });

    if (!participant || participant.tabId !== tabId) {
      throwApiError(404, "not_found", "Participant not found");
    }

    // Cannot remove the tab creator
    if (participant.userId === tab.createdByUserId) {
      throwApiError(400, "validation_error", "Cannot remove the tab owner");
    }

    // Check if participant has any expenses (paid or split)
    const [paidExpenses, splits] = await Promise.all([
      prisma.expense.findFirst({
        where: { tabId, paidByParticipantId: participantId },
      }),
      prisma.expenseSplit.findFirst({
        where: { participantId, expense: { tabId } },
      }),
    ]);

    if (paidExpenses || splits) {
      throwApiError(
        400,
        "validation_error",
        "Cannot remove a participant who has expenses. Delete their expenses first.",
      );
    }

    // Remove the participant
    await prisma.participant.delete({
      where: { id: participantId },
    });

    const result = ok({ removed: true });
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
